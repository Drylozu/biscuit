import type {
    DiscordChannel,
    DiscordChannelPinsUpdate,
    DiscordGuildMemberAdd,
    DiscordGuildMemberRemove,
    DiscordGuildMemberUpdate,
    DiscordInteraction,
    DiscordMemberWithUser,
    DiscordMessage,
    DiscordMessageDelete,
    DiscordReady,
    // DiscordThreadMemberUpdate,
    // DiscordThreadMembersUpdate,
    DiscordThreadListSync,
} from "../vendor/external.ts";
import type { Snowflake } from "../util/Snowflake.ts";
import type { Session } from "../session/Session.ts";
import type { Channel } from "../structures/channels/ChannelFactory.ts";
import ChannelFactory from "../structures/channels/ChannelFactory.ts";
import GuildChannel from "../structures/channels/GuildChannel.ts";
import ThreadChannel from "../structures/channels/ThreadChannel.ts";
import Member from "../structures/Member.ts";
import Message from "../structures/Message.ts";
import User from "../structures/User.ts";
import Interaction from "../structures/interactions/Interaction.ts";

export type RawHandler<T> = (...args: [Session, number, T]) => void;
export type Handler<T extends unknown[]> = (...args: T) => unknown;

export const READY: RawHandler<DiscordReady> = (session, shardId, payload) => {
    session.applicationId = payload.application.id;
    session.botId = payload.user.id;
    session.emit("ready", { ...payload, user: new User(session, payload.user) }, shardId);
};

export const MESSAGE_CREATE: RawHandler<DiscordMessage> = (session, _shardId, message) => {
    session.emit("messageCreate", new Message(session, message));
};

export const MESSAGE_UPDATE: RawHandler<DiscordMessage> = (session, _shardId, new_message) => {
    session.emit("messageUpdate", new Message(session, new_message));
};

export const MESSAGE_DELETE: RawHandler<DiscordMessageDelete> = (session, _shardId, { id, channel_id, guild_id }) => {
    session.emit("messageDelete", { id, channelId: channel_id, guildId: guild_id });
};

export const GUILD_MEMBER_ADD: RawHandler<DiscordGuildMemberAdd> = (session, _shardId, member) => {
    session.emit("guildMemberAdd", new Member(session, member, member.guild_id));
};

export const GUILD_MEMBER_UPDATE: RawHandler<DiscordGuildMemberUpdate> = (session, _shardId, member) => {
    session.emit("guildMemberUpdate", new Member(session, member, member.guild_id));
};

export const GUILD_MEMBER_REMOVE: RawHandler<DiscordGuildMemberRemove> = (session, _shardId, member) => {
    session.emit("guildMemberRemove", new User(session, member.user), member.guild_id);
};

export const INTERACTION_CREATE: RawHandler<DiscordInteraction> = (session, _shardId, interaction) => {
    session.unrepliedInteractions.add(BigInt(interaction.id));

    // could be improved
    setTimeout(() => session.unrepliedInteractions.delete(BigInt(interaction.id)), 15 * 60 * 1000);

    session.emit("interactionCreate", new Interaction(session, interaction));
};

export const CHANNEL_CREATE: RawHandler<DiscordChannel> = (session, _shardId, channel) => {
    session.emit("channelCreate", ChannelFactory.from(session, channel));
};

export const CHANNEL_UPDATE: RawHandler<DiscordChannel> = (session, _shardId, channel) => {
    session.emit("channelUpdate", ChannelFactory.from(session, channel));
};

export const CHANNEL_DELETE: RawHandler<DiscordChannel> = (session, _shardId, channel) => {
    if (!channel.guild_id) return;

    session.emit("channelDelete", new GuildChannel(session, channel, channel.guild_id));
};

export const THREAD_CREATE: RawHandler<DiscordChannel> = (session, _shardId, channel) => {
    if (!channel.guild_id) return;

    session.emit("threadCreate", new ThreadChannel(session, channel, channel.guild_id));
};

export const THREAD_UPDATE: RawHandler<DiscordChannel> = (session, _shardId, channel) => {
    if (!channel.guild_id) return;

    session.emit("threadUpdate", new ThreadChannel(session, channel, channel.guild_id));
};

export const THREAD_DELETE: RawHandler<DiscordChannel> = (session, _shardId, channel) => {
    if (!channel.guild_id) return;

    session.emit("threadDelete", new ThreadChannel(session, channel, channel.guild_id));
};

export const THREAD_LIST_SYNC: RawHandler<DiscordThreadListSync> = (session, _shardId, payload) => {
    session.emit("threadListSync", {
        guildId: payload.guild_id,
        channelIds: payload.channel_ids ?? [],
        threads: payload.threads.map((channel) => new ThreadChannel(session, channel, payload.guild_id)),
        members: payload.members.map((member) =>
            // @ts-ignore: TODO: thread member structure
            new Member(session, member as DiscordMemberWithUser, payload.guild_id)
        ),
    });
};

export const CHANNEL_PINS_UPDATE: RawHandler<DiscordChannelPinsUpdate> = (session, _shardId, payload) => {
    session.emit("channelPinsUpdate", {
        guildId: payload.guild_id,
        channelId: payload.channel_id,
        lastPinTimestamp: payload.last_pin_timestamp ? Date.parse(payload.last_pin_timestamp) : undefined,
    });
};

export const raw: RawHandler<unknown> = (session, shardId, data) => {
    session.emit("raw", data, shardId);
};

export interface Ready extends Omit<DiscordReady, "user"> {
    user: User;
}

// deno-fmt-ignore-file
export interface Events {
    "ready":             Handler<[Ready, number]>;
    "messageCreate":     Handler<[Message]>;
    "messageUpdate":     Handler<[Message]>;
    "messageDelete":     Handler<[{ id: Snowflake, channelId: Snowflake, guildId?: Snowflake }]>;
    "guildMemberAdd":    Handler<[Member]>;
    "guildMemberUpdate": Handler<[Member]>;
    "guildMemberRemove": Handler<[User, Snowflake]>;
    "channelCreate":     Handler<[Channel]>;
    "channelUpdate":     Handler<[Channel]>;
    "channelDelete":     Handler<[GuildChannel]>;
    "channelPinsUpdate": Handler<[{ guildId?: Snowflake, channelId: Snowflake, lastPinTimestamp?: number }]>
    "threadCreate":      Handler<[ThreadChannel]>;
    "threadUpdate":      Handler<[ThreadChannel]>;
    "threadDelete":      Handler<[ThreadChannel]>;
    "threadListSync":    Handler<[{ guildId: Snowflake, channelIds: Snowflake[], threads: ThreadChannel[], members: Member[] }]>
    "interactionCreate": Handler<[Interaction]>;
    "raw":               Handler<[unknown, number]>;
}