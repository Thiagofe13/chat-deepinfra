export default function MessageBubble({ role, content }) {
  const isUser = role === 'user'
  const baseClass =
    'p-3 rounded-xl max-w-[80%] break-words text-sm'
  const userClass = 'bg-blue-600 text-white self-end rounded-br-none'
  const botClass = 'bg-gray-700 text-gray-200 self-start rounded-bl-none border border-gray-600'

  return (
    <div className={`${baseClass} ${isUser ? userClass : botClass}`}>
      {content}
    </div>
  )
}
