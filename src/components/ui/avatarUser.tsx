const UserAvatar = ({ name, avatar }: { name?: string; avatar?: string }) => (
  <div className="flex items-center gap-3">
    {avatar ? (
      <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
    ) : (
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-semibold">
        {name?.charAt(0)}
      </div>
    )}
    <div className="flex-1 min-w-0">
      <div className="font-medium text-sm text-gray-900 truncate">{name || '--'}</div>
    </div>
  </div>
)

export default UserAvatar
