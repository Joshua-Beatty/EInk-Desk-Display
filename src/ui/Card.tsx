import React, { PropsWithChildren } from 'react'
function Card(props: PropsWithChildren<{className?: string}>){
    return (
        <div className={"w-full border-4 p-2 rounded-2xl border-neutral-400   flex flex-col " + props.className}>
            {props.children}
        </div>
    )
}
export default Card