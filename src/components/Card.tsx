import { useRef } from "react";
import Draggable from "react-draggable";

const Card = () => {

    const nodeRef = useRef(null);

    return (
        <Draggable nodeRef={nodeRef}>
            <div ref={nodeRef} className="text-3xl bg-amber-700">Card Component</div>
        </Draggable>
    );
}

export default Card;