import { BaseEntity } from 'src/bases'
import { Column, Entity } from 'typeorm'

@Entity({ name: 'medias' })
export class MediaEntity extends BaseEntity {
	@Column()
	name: string

	@Column()
	file_name: string

	@Column()
	mime_type: string

	@Column()
	size: number

	@Column()
	key: string
}
