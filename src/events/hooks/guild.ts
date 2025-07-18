import {
	type GuildEmojiStructure,
	type GuildMemberStructure,
	type GuildRoleStructure,
	type GuildStructure,
	type StickerStructure,
	Transformers,
	type UserStructure,
} from '../../client/transformers';
import type { UsingClient } from '../../commands';
import { type ObjectToLower, toCamelCase } from '../../common';
import type {
	APIUnavailableGuild,
	GatewayGuildAuditLogEntryCreateDispatchData,
	GatewayGuildBanAddDispatchData,
	GatewayGuildBanRemoveDispatchData,
	GatewayGuildCreateDispatchData,
	GatewayGuildDeleteDispatchData,
	GatewayGuildEmojisUpdateDispatchData,
	GatewayGuildIntegrationsUpdateDispatchData,
	GatewayGuildMemberAddDispatchData,
	GatewayGuildMemberRemoveDispatchData,
	GatewayGuildMembersChunkDispatchData,
	GatewayGuildMemberUpdateDispatchData,
	GatewayGuildRoleCreateDispatchData,
	GatewayGuildRoleDeleteDispatchData,
	GatewayGuildRoleUpdateDispatchData,
	GatewayGuildScheduledEventCreateDispatchData,
	GatewayGuildScheduledEventDeleteDispatchData,
	GatewayGuildScheduledEventUpdateDispatchData,
	GatewayGuildScheduledEventUserAddDispatchData,
	GatewayGuildScheduledEventUserRemoveDispatchData,
	GatewayGuildStickersUpdateDispatchData,
	GatewayGuildUpdateDispatchData,
} from '../../types';

export const GUILD_AUDIT_LOG_ENTRY_CREATE = (_self: UsingClient, data: GatewayGuildAuditLogEntryCreateDispatchData) => {
	return toCamelCase(data);
};

export const GUILD_BAN_ADD = (
	self: UsingClient,
	data: GatewayGuildBanAddDispatchData,
): ObjectToLower<Omit<GatewayGuildBanAddDispatchData, 'user'>> & {
	user: UserStructure;
} => {
	return { ...toCamelCase(data), user: Transformers.User(self, data.user) };
};

export const GUILD_BAN_REMOVE = (
	self: UsingClient,
	data: GatewayGuildBanRemoveDispatchData,
): ObjectToLower<Omit<GatewayGuildBanRemoveDispatchData, 'user'>> & {
	user: UserStructure;
} => {
	return { ...toCamelCase(data), user: Transformers.User(self, data.user) };
};

export const GUILD_CREATE = (self: UsingClient, data: GatewayGuildCreateDispatchData): GuildStructure<'create'> => {
	return Transformers.Guild<'create'>(self, data);
};

export const GUILD_DELETE = async (
	self: UsingClient,
	data: GatewayGuildDeleteDispatchData,
): Promise<GuildStructure<'cached'> | APIUnavailableGuild> => {
	return (await self.cache.guilds?.get(data.id)) ?? data;
};

export const GUILD_EMOJIS_UPDATE = (
	self: UsingClient,
	data: GatewayGuildEmojisUpdateDispatchData,
): ObjectToLower<Omit<GatewayGuildEmojisUpdateDispatchData, 'emojis'>> & {
	emojis: GuildEmojiStructure[];
} => {
	return {
		...toCamelCase(data),
		emojis: data.emojis.map(x => Transformers.GuildEmoji(self, x, data.guild_id)),
	};
};

export const GUILD_INTEGRATIONS_UPDATE = (_self: UsingClient, data: GatewayGuildIntegrationsUpdateDispatchData) => {
	return toCamelCase(data);
};

export const GUILD_MEMBER_ADD = (self: UsingClient, data: GatewayGuildMemberAddDispatchData): GuildMemberStructure => {
	return Transformers.GuildMember(self, data, data.user, data.guild_id);
};

export const GUILD_MEMBER_REMOVE = async (
	self: UsingClient,
	data: GatewayGuildMemberRemoveDispatchData,
): Promise<
	| GuildMemberStructure
	| {
			user: UserStructure;
			guildId: string;
	  }
> => {
	return (
		(await self.cache.members?.get(data.user.id, data.guild_id)) ?? {
			...toCamelCase(data),
			user: Transformers.User(self, data.user),
		}
	);
};

export const GUILD_MEMBERS_CHUNK = (
	self: UsingClient,
	data: GatewayGuildMembersChunkDispatchData,
): ObjectToLower<Omit<GatewayGuildMembersChunkDispatchData, 'members'>> & {
	members: GuildMemberStructure[];
} => {
	return {
		...toCamelCase(data),
		members: data.members.map(x => Transformers.GuildMember(self, x, x.user, data.guild_id)),
	};
};

export const GUILD_MEMBER_UPDATE = async (
	self: UsingClient,
	data: GatewayGuildMemberUpdateDispatchData,
): Promise<[member: GuildMemberStructure, old?: GuildMemberStructure]> => {
	const oldData = await self.cache.members?.get(data.user.id, data.guild_id);
	return [Transformers.GuildMember(self, data, data.user, data.guild_id), oldData];
};

export const GUILD_SCHEDULED_EVENT_CREATE = (
	_self: UsingClient,
	data: GatewayGuildScheduledEventCreateDispatchData,
) => {
	return toCamelCase(data);
};

export const GUILD_SCHEDULED_EVENT_UPDATE = (
	_self: UsingClient,
	data: GatewayGuildScheduledEventUpdateDispatchData,
) => {
	return toCamelCase(data);
};

export const GUILD_SCHEDULED_EVENT_DELETE = (
	_self: UsingClient,
	data: GatewayGuildScheduledEventDeleteDispatchData,
) => {
	return toCamelCase(data);
};

export const GUILD_SCHEDULED_EVENT_USER_ADD = (
	_self: UsingClient,
	data: GatewayGuildScheduledEventUserAddDispatchData,
) => {
	return toCamelCase(data);
};

export const GUILD_SCHEDULED_EVENT_USER_REMOVE = (
	_self: UsingClient,
	data: GatewayGuildScheduledEventUserRemoveDispatchData,
) => {
	return toCamelCase(data);
};

export const GUILD_ROLE_CREATE = (self: UsingClient, data: GatewayGuildRoleCreateDispatchData): GuildRoleStructure => {
	return Transformers.GuildRole(self, data.role, data.guild_id);
};

export const GUILD_ROLE_DELETE = async (
	self: UsingClient,
	data: GatewayGuildRoleDeleteDispatchData,
): Promise<GuildRoleStructure | ObjectToLower<GatewayGuildRoleDeleteDispatchData>> => {
	return (await self.cache.roles?.get(data.role_id)) || toCamelCase(data);
};

export const GUILD_ROLE_UPDATE = async (
	self: UsingClient,
	data: GatewayGuildRoleUpdateDispatchData,
): Promise<[role: GuildRoleStructure, old?: GuildRoleStructure]> => {
	return [Transformers.GuildRole(self, data.role, data.guild_id), await self.cache.roles?.get(data.role.id)];
};

export const GUILD_STICKERS_UPDATE = (
	self: UsingClient,
	data: GatewayGuildStickersUpdateDispatchData,
): ObjectToLower<Omit<GatewayGuildStickersUpdateDispatchData, 'stickers'>> & {
	stickers: StickerStructure[];
} => {
	return {
		...toCamelCase(data),
		stickers: data.stickers.map(x => Transformers.Sticker(self, x)),
	};
};

export const GUILD_UPDATE = async (
	self: UsingClient,
	data: GatewayGuildUpdateDispatchData,
): Promise<[guild: GuildStructure, old?: GuildStructure<'cached'>]> => {
	return [Transformers.Guild(self, data), await self.cache.guilds?.get(data.id)];
};
