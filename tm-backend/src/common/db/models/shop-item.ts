import { Model, Table, Column, DataType } from 'sequelize-typescript'

@Table({
	tableName: 'shop_items',
	modelName: 'ShopItem'
})
export class DbShopItem extends Model<DbShopItem> {
	@Column({ type: DataType.STRING(128), allowNull: false })
	name!: string

	@Column({ type: DataType.STRING(), allowNull: true })
	description!: string

	@Column({ type: DataType.STRING(32), allowNull: false })
	type!: 'discord-roles' | 'manual' | 'membership-extension'

	@Column({ type: DataType.INTEGER(), allowNull: false })
	price!: number

	@Column({ type: DataType.BOOLEAN, allowNull: false, defaultValue: false })
	archived!: boolean

	@Column({ type: DataType.JSON, allowNull: false, defaultValue: {} })
	// - If type === 'manual: {}
	// - If type === 'discord-roles': { roles: string[] }
	// - If type === 'membership-extension: { length: number }
	data!: any
}
