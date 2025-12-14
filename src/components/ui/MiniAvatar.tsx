const MiniAvatar = ({ name, avatar }: { name?: string; avatar?: string }) => {
  if (avatar) {
    return <img src={avatar} alt={name} className="w-9 h-9 rounded-full object-cover" />
  }

  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-xs font-semibold">
      {name?.charAt(0) || '?'}
    </div>
  )
}

export default MiniAvatar
