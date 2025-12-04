```typescript
// useLogin.ts
export const useLogin = () => {
  const navigate = useNavigate()
  
  const loginMutation = useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      // Handle success
      navigate('/dashboard')
    },
    onError: (error) => {
      // Cách 1: 
      handleCommonError(error)
      
      // Cách 2: Custom message
      // handleCommonError(error, 'Đăng nhập thất bại')
      
      // Cách 3: Với callback
      // handleCommonError(error, 'Đăng nhập thất bại', (code) => {
      //   if (code === ERROR_CODE.UNAUTHORIZED) {
      //     console.log('Wrong credentials')
      //   }
      // })
    }
  })
  
  return { loginMutation }
}
---

