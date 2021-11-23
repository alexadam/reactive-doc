import React, { useEffect, useRef, useState } from "react"
import ReactDOM from "react-dom"
import useKeyDown from "./keydown-listener.hook"
import useOutsideClick from "./outside-click.hook"

interface IPopupProps {
  isVisible: boolean
  minWidth: number,
  parentBBOX?: any,
  xOffset?: number,
  onClose: (result: any) => void,
  children?: any
}

const Popup = (props: IPopupProps) => {

  const getPosition = () => {
    let bbox = props.parentBBOX

    if (!bbox) {
      return { top: 0, left: 0 }
    }

    const winScrollTop = document.body.scrollTop || document.documentElement.scrollTop
    const winScrollLeft = document.body.scrollLeft || document.documentElement.scrollLeft
    let popupTopOffset = 15
    let popupLeftOffset = 0

    const tmpPopupRef = popupRef

    if (tmpPopupRef && tmpPopupRef.current) {
      const popupBbox = tmpPopupRef.current.getBoundingClientRect()
      const diffY = (document.body.clientHeight - 10 - bbox.top)
      if (diffY < popupBbox.height) {
        popupTopOffset = -popupBbox.height - 10
      }
      const diffX = (document.body.clientWidth - bbox.left)
      if (diffX < popupBbox.width) {
        popupLeftOffset = popupBbox.width - diffX + 5
      }      
    }

    const coords = {
      top: bbox.top + popupTopOffset,
      left: bbox.left - popupLeftOffset + (props.xOffset ? props.xOffset : 0)
    }
    return coords
  }


  const [position, setPosition] = useState(getPosition())
  const popupRef = useRef<any>(null)

  /// Close Edit Menu on ESC
  useKeyDown((key: any) => {
    if (key.keyCode === 27) {
      props.onClose(null)
    }
  })

  /// Detect Click outside menu - to close it
  useOutsideClick(popupRef, () => {    
    if (props.isVisible) {
      props.onClose(null)
    }
  });

  useEffect(() => {
    let np = getPosition()
    if (np.top !== position.top || np.left !== position.left) {
      setPosition(np)
    }
  })

  useEffect(() => {
    setPosition(getPosition())
  }, [props.parentBBOX])
  
  if (!props.isVisible) {
    return null
  }

  return (
    ReactDOM.createPortal(
      <div className="popup" style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        zIndex: 9999,
        top: position.top + 'px',
        left: position.left + 'px',
        minWidth: props.minWidth + 'px',
      }}>
        <div ref={popupRef} onClick={(e) => e.stopPropagation()}>
          {props.children}
        </div>
      </div>, 
      document.body
    )
   
  )
}
export default Popup