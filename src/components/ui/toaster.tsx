import { toast } from 'sonner'

const SonnerToaster = ({
  type,
  message,
  description = '',
}: {
  type: 'success' | 'error'
  message: string
  description?: string
}) => {
  return toast[type](message, {
    description: description,
  })
}

export default SonnerToaster
