import { PostProps, WorkflowPanels } from '@/perfect-seo-shared-components/data/types';
import { Row, flexRender } from '@tanstack/react-table';
import classNames from 'classnames';
import { FC, Ref, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';


export const DragHandle = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g id="Drag Handle">
      <path id="Vector" d="M4 15V13H20V15H4ZM4 11V9H20V11H4Z" fill="#7E8A95" />
    </g>
  </svg>

);

const DraggablePost: FC<{
  post: PostProps,
  type: WorkflowPanels,
  selected?: string | null,
  setSelected: (val: string) => void,
}> = ({ post, setSelected }) => {


  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => post,
    type: 'post',
  });

  useEffect(() => {
    if (isDragging && post) {
      setSelected(post?.task_id);
    }
  }, [isDragging]);

  const dragRefType = dragRef as unknown as Ref<HTMLDivElement>;
  const previewRefType = previewRef as unknown as Ref<HTMLDivElement>;

  const rowClasses = classNames('card post-card p-3',
    {
      'dragging': isDragging,
    });

  return (
    <div className={rowClasses}>
      <div ref={previewRefType}>
        <div ref={dragRefType} className="">
          <p className="mb-0"> {post?.title}</p>
          {post?.live_post_url && <a href={post?.live_post_url} target="_blank" rel="noreferrer" className="text-decoration-none">{post?.live_post_url}</a>}
        </div>
      </div>
    </div>
  );
};

export default DraggablePost;