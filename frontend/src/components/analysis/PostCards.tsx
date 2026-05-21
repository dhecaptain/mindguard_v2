import type { PostData } from '../../types'
import { getRiskLabel } from '../../types'
import RiskBadge from '../shared/RiskBadge'

interface PostCardsProps {
  posts: PostData[]
  n?: number
}

export default function PostCards({ posts, n = 20 }: PostCardsProps) {
  const displayed = posts.slice(0, n)

  if (displayed.length === 0) {
    return (
      <div className="text-center py-[40px] text-[#9ca3af] text-[0.82rem]">
        No posts match the current filter.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-[8px]">
      {displayed.map((post, i) => {
        const { color } = getRiskLabel(post.risk_score)
        return (
          <div
            key={i}
            className="bg-white rounded-[8px] border border-[#f1f5f9] p-[12px_14px] border-l-[4px]"
            style={{ borderLeftColor: color }}
          >
            <div className="flex items-center gap-[8px] mb-[6px] flex-wrap">
              {post.subreddit && (
                <span className="text-[0.7rem] text-[#0F766E] font-semibold">r/{post.subreddit}</span>
              )}
              {post.type && (
                <span className="text-[0.62rem] text-[#9ca3af] bg-[#f1f5f9] px-[6px] py-[2px] rounded-full">
                  {post.type}
                </span>
              )}
              <span className="text-[0.62rem] text-[#9ca3af] ml-auto">
                {post.date ? new Date(post.date).toLocaleDateString() : ''}
              </span>
            </div>
            <p className="text-[0.8rem] text-[#4b5563] line-clamp-2 leading-[1.6]">{post.text}</p>
            <div className="flex items-center gap-[8px] mt-[6px]">
              <RiskBadge score={post.risk_score} />
              {post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.68rem] text-[#0F766E] ml-auto hover:underline"
                >
                  View source →
                </a>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
