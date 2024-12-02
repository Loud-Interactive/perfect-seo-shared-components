import * as TooltipPrim from "@radix-ui/react-tooltip";
const Tooltip = ({ children }) => {
  return (
    <TooltipPrim.Provider>
      <TooltipPrim.Root>
        <TooltipPrim.Trigger className="btn btn-transparent p-0">
          <i className="bi bi-question tool-tip-button" />
        </TooltipPrim.Trigger>
        <TooltipPrim.Portal>
          <TooltipPrim.Content>
            <div className='card p-1 bg-primary mb-1 tool-tip'>
              {children}
            </div>
          </TooltipPrim.Content>
        </TooltipPrim.Portal>
      </TooltipPrim.Root>
    </TooltipPrim.Provider>
  )
}

export default Tooltip