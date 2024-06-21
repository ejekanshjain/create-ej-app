import { updateUserById } from '@/data-access/user'

type UpdateUserNameUseCaseInput = {
  name: string
}

export const updateUserNameUseCase = async (
  id: string,
  data: UpdateUserNameUseCaseInput
) => {
  await updateUserById(id, {
    name: data.name
  })
}
