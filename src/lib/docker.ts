import Docker from "dockerode";
import { v4 as uuidv4 } from "uuid";

const docker = new Docker();

const MATTERBRIDGE_IMAGE = "42wim/matterbridge:latest";

export interface BridgeConfig {
  id: string;
  name: string;
  slackToken: string;
  slackChannel: string;
  slackTeamName: string;
  teamsAppId: string;
  teamsAppPassword: string;
  teamsTenantId: string;
  teamsTeamId: string;
  teamsChannel: string;
  apiToken: string;
  hostUrl: string;
}

export function generateTomlConfig(config: BridgeConfig): string {
  return `
[general]
RemoveRecipient=true
MediaDownloadPath="/tmp"

[slack.${config.slackTeamName}]
Token="${config.slackToken}"
PrefixMessagesWithNick=true
EditDisable=false
EditSuffix=" (edited)"
RemoteNickFormat="[{PROTOCOL}] <{NICK}> "

[msteams.client]
TenantID="${config.teamsTenantId}"
ClientID="${config.teamsAppId}"
ClientSecret="${config.teamsAppPassword}"
TeamID="${config.teamsTeamId}"
PrefixMessagesWithNick=true
RemoteNickFormat="[{PROTOCOL}] <{NICK}> "

[api.intelligence_layer]
BindAddress="0.0.0.0:4000"
Token="${config.apiToken}"
Buffer=1000
RemoteNickFormat="[{PROTOCOL}] <{NICK}> "

[[gateway]]
name="bridge-${config.id}"
enable=true

    [[gateway.inout]]
    account="slack.${config.slackTeamName}"
    channel="${config.slackChannel}"

    [[gateway.inout]]
    account="msteams.client"
    channel="${config.teamsChannel}"

    [[gateway.inout]]
    account="api.intelligence_layer"
    channel="archive"
`.trim();
}

export async function pullImage(): Promise<void> {
  return new Promise((resolve, reject) => {
    docker.pull(MATTERBRIDGE_IMAGE, (err: Error | null, stream: NodeJS.ReadableStream) => {
      if (err) {
        reject(err);
        return;
      }
      
      docker.modem.followProgress(stream, (err: Error | null) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  });
}

export async function createBridgeContainer(
  config: BridgeConfig,
  tomlContent: string
): Promise<string> {
  const containerName = `rainbow-bridge-${config.id}`;
  
  // Check if container already exists
  const containers = await docker.listContainers({ all: true });
  const existing = containers.find(c => c.Names.includes(`/${containerName}`));
  
  if (existing) {
    // Remove existing container
    const container = docker.getContainer(existing.Id);
    try {
      await container.stop();
    } catch {
      // Container might not be running
    }
    await container.remove();
  }

  // Create config file content as base64
  const configBase64 = Buffer.from(tomlContent).toString("base64");
  
  const container = await docker.createContainer({
    Image: MATTERBRIDGE_IMAGE,
    name: containerName,
    Env: [
      `MATTERBRIDGE_CONFIG=${configBase64}`,
    ],
    ExposedPorts: {
      "4000/tcp": {},
    },
    HostConfig: {
      PortBindings: {
        "4000/tcp": [{ HostPort: "0" }], // Random port
      },
      ExtraHosts: ["host.docker.internal:host-gateway"],
      RestartPolicy: {
        Name: "unless-stopped",
      },
    },
    Cmd: [
      "/bin/sh",
      "-c",
      `echo $MATTERBRIDGE_CONFIG | base64 -d > /etc/matterbridge/matterbridge.toml && /bin/matterbridge -conf /etc/matterbridge/matterbridge.toml`,
    ],
  });

  await container.start();
  
  return container.id;
}

export async function startContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  await container.start();
}

export async function stopContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  await container.stop();
}

export async function removeContainer(containerId: string): Promise<void> {
  const container = docker.getContainer(containerId);
  try {
    await container.stop();
  } catch {
    // Container might not be running
  }
  await container.remove();
}

export async function getContainerStatus(containerId: string): Promise<string> {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    return info.State.Status;
  } catch {
    return "not_found";
  }
}

export async function getContainerLogs(containerId: string, tail: number = 100): Promise<string> {
  const container = docker.getContainer(containerId);
  const logs = await container.logs({
    stdout: true,
    stderr: true,
    tail,
    timestamps: true,
  });
  
  return logs.toString();
}

export async function getContainerPort(containerId: string): Promise<number | null> {
  try {
    const container = docker.getContainer(containerId);
    const info = await container.inspect();
    const portBindings = info.NetworkSettings.Ports["4000/tcp"];
    
    if (portBindings && portBindings.length > 0) {
      return parseInt(portBindings[0].HostPort, 10);
    }
    
    return null;
  } catch {
    return null;
  }
}
