import type { ReturnCache, WorkerClient } from '../..';
import type { GuildStructure } from '../../client';
import { calculateShardId, type ObjectToLower } from '../../common';
import type { ImageOptions } from '../../common/types/options';
import { type APIPartialGuild, GuildFeature } from '../../types';
import type { ShardManager } from '../../websocket';
import { DiscordBase } from './DiscordBase';

export interface BaseGuild extends ObjectToLower<APIPartialGuild> {}
/**
 * Base guild class
 */
export class BaseGuild extends DiscordBase<APIPartialGuild> {
	get partnered(): boolean {
		if (!this.features) {
			return false;
		}
		return this.features.includes(GuildFeature.Partnered);
	}

	/**
	 * If the guild is verified.
	 * @link https://discord.com/developers/docs/resources/guild#guild-object-guild-features
	 */
	get verified(): boolean {
		if (!this.features) {
			return false;
		}
		return this.features.includes(GuildFeature.Verified);
	}

	/**
	 * Fetch guild on API
	 */
	fetch(mode?: 'rest' | 'flow'): Promise<GuildStructure<'cached' | 'api'>>;
	fetch(mode: 'cache'): ReturnCache<GuildStructure<'cached'> | undefined>;
	fetch(mode: 'cache' | 'rest' | 'flow' = 'flow') {
		switch (mode) {
			case 'cache':
				return (
					this.client.cache.guilds?.get(this.id) ||
					(this.client.cache.adapter.isAsync ? (Promise.resolve() as any) : undefined)
				);
			default:
				return this.client.guilds.fetch(this.id, mode === 'rest');
		}
	}

	/**
	 * Leave the guild.
	 */
	leave() {
		return this.client.guilds.leave(this.id);
	}

	/**
	 * iconURL gets the current guild icon.
	 * @link https://discord.com/developers/docs/reference#image-formatting
	 */
	iconURL(options?: ImageOptions): string | undefined {
		if (!this.icon) return;

		return this.rest.cdn.icons(this.id).get(this.icon, options);
	}

	/**
	 * splashURL gets the current guild splash as a string.
	 * @link https://discord.com/developers/docs/reference#image-formatting
	 * @param options - Image options for the splash url.
	 * @returns Splash url or void.
	 */
	splashURL(options?: ImageOptions): string | undefined {
		if (!this.splash) return;

		return this.rest.cdn['discovery-splashes'](this.id).get(this.splash, options);
	}

	/**
	 * bannerURL gets the current guild banner as a string.
	 * @link https://discord.com/developers/docs/reference#image-formatting
	 * @param options - Image options for the banner url.
	 * @returns Banner url or void
	 */
	bannerURL(options?: ImageOptions): string | undefined {
		if (!this.banner) return;

		return this.rest.cdn.banners(this.id).get(this.banner, options);
	}

	/**
	 * Shard ID of the guild.
	 * @returns Shard ID or -1 if the client is not gateway based.
	 */
	get shardId() {
		if ('gateway' in this.client) {
			return (this.client.gateway as ShardManager).calculateShardId(this.id) as never;
		}
		if ('shards' in this.client) {
			return calculateShardId(this.id, (this.client as WorkerClient).workerData.totalShards);
		}
		return -1;
	}

	/**
	 * Shard of the guild.
	 * @returns Shard or undefined, if the client is not gateway based always undefined.
	 */
	get shard() {
		if ('gateway' in this.client) {
			return (this.client.gateway as ShardManager).get(this.shardId) as never;
		}

		if ('shards' in this.client) {
			return (this.client as WorkerClient).shards.get(this.shardId);
		}
		return undefined;
	}

	toString(): string {
		return this.name;
	}
}
