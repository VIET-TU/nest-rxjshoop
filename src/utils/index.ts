import { UpdateProducttDto } from 'src/products/dtos/update-product.dto'

export const removeUndefinedObject = (obj: UpdateProducttDto) => {
	Object.keys(obj).forEach((key) => {
		if (obj[key] && typeof obj[key] === 'object') removeUndefinedObject(obj[key])
		else if (obj[key] == null) {
			delete obj[key]
		}
	})
	return obj
}
