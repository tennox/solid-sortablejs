import { JSX, JSXElement, Setter } from "solid-js";
import SortableJs from "sortablejs";
export type SortableEvent = SortableJs.SortableEvent;
interface SortableProps<T> extends SortableJs.Options {
    items: T[];
    setItems: Setter<T[]>;
    idField: keyof T;
    class?: string;
    style?: JSX.CSSProperties;
    id?: string;
    children: (item: T) => JSXElement;
}
export default function Sortable<T>(props: SortableProps<T>): JSX.Element;
export {};
