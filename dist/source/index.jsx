import { createEffect, For, onCleanup, onMount, splitProps } from "solid-js";
import SortableJs from "sortablejs";
const SORTABLE_OPTION_FIELDS = [
    'animation', 'chosenClass', 'dataIdAttr', 'delay', 'delayOnTouchOnly', 'direction', 'disabled', 'dragClass', 'draggable', 'dragoverBubble', 'dropBubble', 'easing',
    'fallbackClass', 'fallbackOffset', 'fallbackOnBody', 'fallbackTolerance', 'filter', 'forceFallback', 'ghostClass', 'group', 'handle', 'ignore',
    'invertedSwapThreshold', 'invertSwap', 'onAdd', 'onChange', 'onChoose', 'onClone', 'onEnd', 'onFilter',
    'onMove', 'onRemove', 'onSelect', 'onSort', 'onStart', 'onUnchoose', 'onUpdate', 'preventOnFilter', 'removeCloneOnHide', 'setData', 'sort', 'swapThreshold',
];
// Would love to type-check if all fields are present, but that seems rather challenging - https://stackoverflow.com/questions/58167616/typescript-create-an-exhaustive-tuple-type-from-another-type/58170994#58170994
const OUR_PROPS = ['items', 'setItems', 'idField', 'class', 'style', 'id', 'children'];
const dragging = {
    item: undefined,
};
export default function Sortable(props) {
    let sortableContainerRef;
    let sortable;
    const [options, otherAndOurProps] = splitProps(props, SORTABLE_OPTION_FIELDS);
    const [ourProps, otherProps] = splitProps(otherAndOurProps, OUR_PROPS);
    onMount(() => {
        sortable = SortableJs.create(sortableContainerRef, {
            ...options,
            animation: 150,
            onStart(event) {
                dragging.item = ourProps.items[parseInt(event.item.dataset.index)];
                options.onStart?.(event);
            },
            onAdd(event) {
                const children = [...event.to?.children];
                const newItems = children.map((v) => ourProps.items.find((item) => item[ourProps.idField].toString() === v.dataset.id) || dragging.item);
                // from: where it came from
                // to:   added to
                children.splice(event.newIndex, 1);
                event.to?.replaceChildren(...children);
                ourProps.setItems(newItems);
                options.onAdd?.(event);
            },
            onRemove(event) {
                // from: where it removed from
                // to: where it added to
                const children = [...event.from?.children];
                const newItems = children.map((v) => ourProps.items.find((item) => item[ourProps.idField].toString() === v.dataset.id));
                children.splice(event.oldIndex, 0, event.item);
                event.from.replaceChildren(...children);
                ourProps.setItems(newItems);
                options.onRemove?.(event);
            },
            onEnd(event) {
                const children = [...sortableContainerRef?.children];
                const newItems = children.map((v) => ourProps.items.find((item) => item[ourProps.idField].toString() === v.dataset.id));
                children.sort((a, b) => parseInt(a.dataset.index) - parseInt(b.dataset.index));
                sortableContainerRef?.replaceChildren(...children);
                ourProps.setItems(newItems);
                dragging.item = undefined;
                options.onEnd?.(event);
            },
        });
        // console.debug("Sortable created:", sortable)
        onCleanup(() => {
            sortable.destroy();
        });
    });
    createEffect((prev) => {
        const clonedProps = { ...options };
        if (!prev) {
            //console.debug('props init', clonedProps)
        }
        else {
            const diff = Object.entries(clonedProps).filter(([key, newVal]) => newVal != prev[key]);
            //console.debug('props update', diff, { newProps: clonedProps, prev })
            for (const [key, newVal] of diff) {
                if (['onStart', 'onAdd', 'onRemove', 'onEnd'].includes(key))
                    console.warn(`Reactive callbacks are not supported yet in solid-sortablejs. Changed:`, key);
                else
                    sortable.option(key, newVal);
            }
        }
        return clonedProps;
    }, null);
    return (<div {...otherProps} ref={sortableContainerRef} class={"sortablejs" + (ourProps.class ? ` ${ourProps.class}` : '')}>
      <For each={ourProps.items}>
        {(item, i) => (<div data-id={item[ourProps.idField]} data-index={i()}>
            {ourProps.children(item)}
          </div>)}
      </For>
    </div>);
}