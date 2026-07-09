// src/components/Comments.tsx
'use client';

import * as React from 'react';
import { createComment, CommentNode } from '@/lib/graphql-client';
import { toast } from 'sonner';

interface CommentsProps {
  postId: number; // WordPress database ID
  initialComments: CommentNode[];
}

export function Comments({ postId, initialComments }: CommentsProps) {
  const [comments, setComments] = React.useState<CommentNode[]>(initialComments);
  const [author, setAuthor] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [content, setContent] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !email.trim() || !content.trim()) {
      toast.error('ALL FIELDS ARE REQUIRED.');
      return;
    }

    if (!email.includes('@')) {
      toast.error('INVALID CORPORATE EMAIL ADDRESS.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await createComment(postId, author, email, content);
      
      if (res?.success) {
        toast.success('COMMENT SUBMITTED FOR EDITORIAL REVIEW.');
        
        // Optimistically add comment to current display list
        const newComment: CommentNode = {
          id: res.comment?.id || `temp-${Date.now()}`,
          date: new Date().toISOString(),
          content: content.replace(/\n/g, '<br/>'),
          author: {
            node: {
              name: author,
              avatar: {
                url: 'https://secure.gravatar.com/avatar/ad516503a11cd5ca435acc9bb6523536?s=96'
              }
            }
          }
        };
        
        setComments(prev => [...prev, newComment]);
        setContent('');
        setSuccess(true);
      } else {
        toast.error('SUBMISSION FAILED. PLEASE VERIFY CREDENTIALS.');
      }
    } catch (err) {
      console.error(err);
      toast.error('AN ERROR OCCURRED DURING COMMENT RECORDING.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 mt-16 border-t border-border pt-16">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h3 className="text-xs font-mono font-semibold text-muted-foreground tracking-[0.2em] uppercase">
          EDITORIAL CORRESPONDENCE ({comments.length})
        </h3>
      </div>

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="flex flex-col">
          {comments.map((comment) => {
            const dateFormatted = new Date(comment.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div 
                key={comment.id}
                className="flex gap-6 py-6 border-b border-border bg-transparent"
              >
                {comment.author.node.avatar?.url ? (
                  <img
                    src={comment.author.node.avatar.url}
                    alt={comment.author.node.name}
                    className="h-8 w-8 rounded-none border border-border grayscale flex-shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-none bg-secondary flex items-center justify-center border border-border text-[10px] font-mono text-muted-foreground flex-shrink-0">
                    AU
                  </div>
                )}
                
                <div className="flex flex-col gap-2 flex-grow">
                  <div className="flex items-center justify-between font-mono text-[9px] tracking-[0.2em] text-muted-foreground uppercase">
                    <span className="font-semibold text-foreground">
                      {comment.author.node.name}
                    </span>
                    <span>
                      {dateFormatted}
                    </span>
                  </div>
                  <div 
                    className="text-xs leading-relaxed text-foreground wp-comment-text mt-1"
                    dangerouslySetInnerHTML={{ __html: comment.content }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-12 text-center text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em] border border-border">
          No entries recorded. Initiate correspondence below.
        </div>
      )}

      {/* Comment Submission Form */}
      <div className="border border-border p-8 flex flex-col gap-6 bg-transparent">
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">POST CORRESPONDENCE</span>
        
        <form onSubmit={handleSubmitComment} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">AUTHOR IDENTITY</label>
              <input
                type="text"
                placeholder="ENTER FULL NAME..."
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
                className="bg-transparent py-2 text-xs text-foreground placeholder-zinc-400 focus:border-foreground focus:outline-none border-b border-border transition-all font-mono rounded-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">CORPORATE EMAIL</label>
              <input
                type="email"
                placeholder="ENTER EMAIL ADDRESS..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-transparent py-2 text-xs text-foreground placeholder-zinc-400 focus:border-foreground focus:outline-none border-b border-border transition-all font-mono rounded-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[9px] font-mono text-muted-foreground uppercase tracking-[0.2em]">CORRESPONDENCE TEXT</label>
            <textarea
              placeholder="ENTER STRATEGIC FEEDBACK OR ENQUIRIES ON THIS BRIEFING..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={4}
              className="bg-transparent py-2 text-xs text-foreground placeholder-zinc-400 focus:border-foreground focus:outline-none border-b border-border transition-all font-mono resize-none rounded-none"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="border border-border hover:border-foreground bg-transparent text-foreground hover:bg-secondary px-6 py-3 text-xs font-mono tracking-[0.2em] uppercase transition-all disabled:opacity-50 cursor-pointer rounded-none"
            >
              {submitting ? 'TRANSMITTING...' : success ? 'TRANSMITTED' : 'SUBMIT CORRESPONDENCE'}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
