import { Model, Table, Column, DataType, BelongsTo } from 'sequelize-typescript'
import { DbUser } from './user'
import { DbShopItem } from './shop-item'

@Table({
	tableName: 'shop_orders',
	modelName: 'ShopOrder'
})
export class DbShopOrder extends Model<DbShopOrder> {
	@Column({ type: DataType.INTEGER(), allowNull: false })
	itemId!: number

	@Column({ type: DataType.INTEGER(), allowNull: false })
	userId!: number

	@Column({ type: DataType.DATE(), allowNull: true })
	fulfilledAt!: Date | null

	//
	// MODEL LINKING
	//
	@BelongsTo(() => DbShopItem, 'itemId')
	item?: DbShopItem

	@BelongsTo(() => DbUser, 'userId')
	user?: DbUser
}
