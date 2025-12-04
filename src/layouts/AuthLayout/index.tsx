import { Outlet } from 'react-router'

const AuthLayout = () => {
  return (
    <>
      <div className="min-h-screen flex items-center justify-center p-4">
        <Outlet />
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/background-login.png)',
          }}
        />
      </div>
    </>
  )
}

export default AuthLayout
