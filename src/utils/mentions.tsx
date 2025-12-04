import React from 'react'

export interface MentionUser {
  id: number
  email: string
  name: string
}

/**
 * Parse message with @mentions and convert to clickable React elements
 * Message format: "@JohnDoe please review" (plain @username, not @[username](id))
 * @param message - Message with @mentions
 * @param mentionUsers - Array of mentioned users from API
 * @param onUserClick - Callback when user clicks on a mention
 * @returns Array of React nodes with clickable mentions
 */
export const parseMentionsToHTML = (
  message: string,
  mentionUsers: MentionUser[],
  onUserClick: (userId: number) => void
): React.ReactNode[] => {
  if (!message) return [message]
  if (!mentionUsers || mentionUsers.length === 0) return [message]

  const parts: React.ReactNode[] = []

  // Create a map of name -> user for quick lookup
  const userMap = new Map<string, MentionUser>()
  mentionUsers.forEach((user) => {
    userMap.set(user.name, user)
  })

  // Sort users by name length (longest first) to handle overlapping names
  const sortedUsers = [...mentionUsers].sort((a, b) => b.name.length - a.name.length)

  const processedIndices = new Set<number>()

  sortedUsers.forEach((user) => {
    const pattern = new RegExp(`@${user.name}(?=\\s|$|[,.:;!?])`, 'g')
    let match

    while ((match = pattern.exec(message)) !== null) {
      const startIdx = match.index
      const endIdx = startIdx + match[0].length

      // Check if this position was already processed
      let isOverlapping = false
      for (let i = startIdx; i < endIdx; i++) {
        if (processedIndices.has(i)) {
          isOverlapping = true
          break
        }
      }

      if (!isOverlapping) {
        // Mark these indices as processed
        for (let i = startIdx; i < endIdx; i++) {
          processedIndices.add(i)
        }
      }
    }
  })

  // Now build the parts based on processed indices
  let currentIndex = 0

  // Group consecutive indices into ranges
  const ranges: Array<{ start: number; end: number; user: MentionUser }> = []

  sortedUsers.forEach((user) => {
    const pattern = new RegExp(`@${user.name}(?=\\s|$|[,.:;!?])`, 'g')
    let match

    while ((match = pattern.exec(message)) !== null) {
      const startIdx = match.index
      const endIdx = startIdx + match[0].length

      // Check if already in ranges
      const exists = ranges.some((r) => r.start === startIdx)
      if (!exists) {
        ranges.push({ start: startIdx, end: endIdx, user })
      }
    }
  })

  // Sort ranges by start index
  ranges.sort((a, b) => a.start - b.start)

  ranges.forEach((range, idx) => {
    // Add text before mention
    if (range.start > currentIndex) {
      parts.push(
        <React.Fragment key={`text-${currentIndex}`}>
          {message.slice(currentIndex, range.start)}
        </React.Fragment>
      )
    }

    // Add clickable mention
    parts.push(
      <span
        key={`mention-${range.user.id}-${idx}`}
        onClick={(e) => {
          e.stopPropagation()
          onUserClick(range.user.id)
        }}
        className="inline-block cursor-pointer font-medium transition-all"
        style={{
          backgroundColor: '#dbeafe',
          color: '#1e40af',
          borderRadius: '3px',
          padding: '1px 4px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#bfdbfe'
          e.currentTarget.style.textDecoration = 'underline'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#dbeafe'
          e.currentTarget.style.textDecoration = 'none'
        }}
      >
        @{range.user.name}
      </span>
    )

    currentIndex = range.end
  })

  // Add remaining text
  if (currentIndex < message.length) {
    parts.push(
      <React.Fragment key={`text-${currentIndex}`}>{message.slice(currentIndex)}</React.Fragment>
    )
  }

  return parts.length > 0 ? parts : [message]
}

/**
 * Convert mentions to plain text (remove markup)
 * @param message - Message with mentions format: "@Username"
 * @returns Plain text with @mentions
 */
export const convertMentionsToPlainText = (message: string): string => {
  return message // Already plain text in this format
}
