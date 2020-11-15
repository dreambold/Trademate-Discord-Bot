import { Model, Column, DataType, Table } from 'sequelize-typescript'
import { GuildMember } from 'discord.js'

@Table({
	tableName: 'discord_guild_members',
	modelName: 'DiscordGuildMember'
})
export class DbDiscordGuildMember extends Model<DbDiscordGuildMember> {
	@Column({ type: DataType.STRING(32), allowNull: false })
	username!: string

	@Column({ type: DataType.STRING(4), allowNull: false })
	discriminator!: string

	@Column({ type: DataType.STRING(128), allowNull: false })
	avatarURI!: string

	@Column({ type: DataType.BIGINT(), allowNull: false })
	discordUserId!: string

	@Column({ type: DataType.BIGINT(), allowNull: false })
	discordGuildId!: string

	@Column({ type: DataType.ARRAY(DataType.BIGINT()), allowNull: false })
	discordRoleIds!: string[]

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: true })
	active!: boolean

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
	bot!: boolean

	updateFromMember(member: GuildMember) {
		this.discordGuildId = member.guild.id
		this.discordUserId = member.id
		this.username = member.user.username
		this.discriminator = member.user.discriminator
		this.avatarURI = member.user.displayAvatarURL({
			format: 'png'
		})
		this.discordRoleIds = member.roles.cache.map(r => r.id)
		this.bot = member.user.bot

		return this
	}
}
