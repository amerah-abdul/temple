import type { Hash } from './types';

import TempleDocument from './TempleRegistry';
import TempleElement from './TempleElement';
import emitter from './TempleEmitter';
import __APP_DATA__ from './data';

/**
 * Temple web component class
 */
export default abstract class TempleComponent extends HTMLElement {
  //name of the component [ tag-name, className ]
  public static component: [ string, string ];

  /**
   * Self registers the component
   */
  public static register() {
    customElements.define(
      this.component[0], 
      this as unknown as CustomElementConstructor
    );
  }

  //whether the component has initiated
  //this is a flag used by signals to check
  //the number of signals that exists
  //in this component
  protected _initiated: boolean = false;
  //the callback to render just the children 
  //(wo initializing the variables again)
  protected _template: (() => (Element|false)[])|null = null;
  //the initial children
  protected _children: ChildNode[]|undefined = undefined;

  /**
   * Returns the component styles
   */
  public abstract styles(): string;

  /**
   * Returns the component template
   */
  public abstract template(): () => (Element|false)[];

  /**
   * Returns the component's metadata
   */
  public get metadata() {
    const [ tagname, classname ] = (
      this.constructor as typeof TempleComponent
    ).component;
    return { tagname, classname };
  }

  /**
   * Returns the original component's children
   * before the component was initiated
   */
  public get originalChildren() {
    return this._children;
  }

  /**
   * Returns the component's element registry
   */
  public get element() {
    return TempleDocument.get(this) as TempleElement;
  }

  /**
   * Returns the component properties
   */
  public get props() {
    return Object.assign({}, this.element.attributes);
  }

  /**
   * Returns whether the component has initiated
   */
  public get initiated() {
    return this._initiated;
  }

  /**
   * Sets the component properties
   */
  public set props(props: Hash) {
    this.element.setAttributes(Object.assign({}, props));
    this.render();
  }

  /**
   * Add this component to the overall registry
   */
  public constructor() {
    super();
    this.init();
  }

  /**
   * Called when component moved to a new document
   */
  public adoptedCallback() {
    this.render();
  }

  /**
   * Called when an attribute is added, removed, updated, or replaced
   * but you need to set observedAttributes first.
   * ie. static observedAttributes = ["color", "size"]; 
   */
  public attributeChangedCallback(
    name: string, 
    previous: string, 
    value: string
  ) {
    this.props = { ...this.props, [name]: value };
  }

  /**
   * Called when the element is inserted into a document,
   */
  public connectedCallback() {
    //attributes are ready here
    this.wait();
  }

  /**
   * Called when the element is removed from a document
   */
  public disconnectedCallback() {
    //remove listeners here
  }

  /**
   * Returns the parent component (if any)
   */
  public getParentComponent() {
    let parent = this.parentElement;
    while (parent) {
      if (parent instanceof TempleComponent) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  public init(attributes: Hash = {}) {
    TempleDocument.register(this, attributes);
  }

  /**
   * Renders the component
   */
  public render() {
    //get the parent component
    const parent = this.getParentComponent();
    //if parent is not initiated, wait for it
    //(this is the hydration logic)
    if (parent && !parent.initiated) {
      return;
    }
    //set the current component
    __APP_DATA__.set('current', this);
    //get the styles
    const styles = this.styles();
    //get the template
    if (!this._template) {
      //this will only initialize the variables once
      this._template = this.template();
    //there's a template, so it means it was mounted
    } else {
      //emit the unmounted event
      emitter.emit('unmounted', this);
    }
    //get the children build w/o re-initializing the variables
    const children = this._template().filter(Boolean) as Element[];
    //if no styles, just set the innerHTML
    if (styles.length === 0) {
      //empty the current text content
      this.textContent = '';
      //now append the children
      children.forEach(child => this.appendChild(child));
    //there are styles, use shadow dom
    } else {
      //if shadow root is not set, create it
      if (!this.shadowRoot) {
        this.attachShadow({ mode: 'open' });
      }

      const shadowRoot = this.shadowRoot as ShadowRoot;
      //empty the current text content
      //the old data is captured in props
      this.textContent = '';
      shadowRoot.textContent = '';
      //append the styles
      const style = document.createElement('style');
      style.innerText = styles;
      shadowRoot.appendChild(style);
      //now append the children
      children.forEach(child => this.shadowRoot?.appendChild(child));
    }
    //reset the current component
    __APP_DATA__.delete('current');
    this._initiated = true;
    //emit the mounted event
    emitter.emit('mounted', this);
    return this.shadowRoot ? this.shadowRoot.innerHTML :this.innerHTML;
  }

  /**
   * Waits for the document to be first ready
   */
  public wait() {
    if (document.readyState !== 'loading') {
      this._update();
    } else {
      const next = () => {
        this._update();
        emitter.unbind('ready', next);
      }
      emitter.on('ready', next);
    }
  }

  /**
   * Sets the initial properties and children
   */
  protected _update() { 
    //if children are not set
    if (typeof this._children === 'undefined') {
      this._children = Array.from(this.childNodes || []);
    }
    //settings props will try to trigger a render
    this.props = Object.assign({}, this.element.attributes);
    //only render if not initiated
    if (!this._initiated) {
      this.render();
    }
  }

  /**
   * Converts a value to a node list
   * used to be inserted into the component
   * child list in template()
   */
  protected _toNodeList(value: any) {
    if (value instanceof Node) {
      return [ value ];
    }

    if (Array.isArray(value)) {
      if (value.every(item => item instanceof Node)) {
        return value;
      }
    }

    return [ TempleDocument.createText(String(value)) ];
  }
}