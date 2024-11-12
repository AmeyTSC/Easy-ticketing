import { model, Schema, Document } from 'mongoose';
import { Comment } from 'src/Interface/comments.interface';

const CommentSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export {CommentSchema};
export const CommentModel = model<Comment & Document>('Comment', CommentSchema);
