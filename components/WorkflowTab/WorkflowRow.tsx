import { PostProps } from "@/perfect-seo-shared-components/data/types";
import DraggablePost from "./DraggablePost"
import { useDrop } from "react-dnd";
import { Ref } from "react";
import classNames from "classnames";
const WorkflowRow = ({ posts, reorderRow, selected, setSelected, type }) => {


  const [{ isOver }, dropRef] = useDrop({
    accept: 'post',
    drop: (draggedRow: PostProps) => reorderRow(draggedRow, type),
    collect: (monitor) =>
      ({ isOver: monitor?.isOver() }),
  });

  const dropRefType = dropRef as unknown as Ref<HTMLDivElement>;
  const rowClasses = classNames("card  p-3", {
    'bg-secondary': !isOver,
    'bg-primary': isOver,
  })
  return (
    <div className={rowClasses} ref={dropRefType}>
      <div className="row d-flex flex-column align-items-stretch justify-content-center g-3">
        {isOver &&
          <div className="card p-3 bg-primary text-center">
            <h5 className="text-white">Drop here to reorder</h5>
          </div>}
        {posts.length > 0 ? posts.map((post, index) => {
          return (
            <DraggablePost post={post} key={`indexed-${index}`} selected={selected} setSelected={setSelected} type={type} />
          )
        }

        ) : <div className="text-center">No indexed posts</div>}
      </div>
    </div>
  )
}

export default WorkflowRow