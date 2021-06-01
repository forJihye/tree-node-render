import './style.css';
import domData from "./dom.json";

const getKeyByValue = (object: any, value: any) => Object.keys(object).find(key => object[key] === value)
const createElement = (tagName: string, data: {name: string, type: string}) => Object.assign(document.createElement(tagName), {
  innerText: data.name,
  className: `${data.type}-${data.name}`
})

type Children = {
  id: number;
  name: string;
  type: string;
  isOpen: boolean;
  children: Children[];
};

interface MenuItem {
  name: string;
  id: number;
  type: string;
  isOpen: boolean;
  children: MenuItem[];
  open(node: HTMLElement): void;
  close(): void;
  allOpen(): void;
  allClose(): void;
  add(item: MenuItem): void;
  remove(item: MenuItem): void;
  onupdate(target: MenuItem): void;
}

class MenuItem implements MenuItem {
  name: string;
  id: number;
  type: string;
  isVisible: boolean = true;
  isOpen: boolean;
  children: MenuItem[];
  constructor(data: MenuItem){
    this.name = data.name
    this.id = data.id
    this.type = data.type
    this.isOpen = data.isOpen
    this.children = [];
  }
  open(){
    this.isOpen = true
  }
  close(){
    this.isOpen = false
  }
  toggle(){
    this.isOpen = !this.isOpen
  }
  allOpen(){}
  allClose(){}
  add(item: MenuItem){}
  remove(item: MenuItem){}
  onupdate(target: MenuItem){}
}

class Reneder {
  root: HTMLElement;
  mapMenuItem: Map<HTMLElement | MenuItem, MenuItem | HTMLElement> = new Map();
  menuItem?: MenuItem;
  constructor(root: HTMLElement, menuItem: MenuItem){
    this.root = root;
    const stack = [menuItem];
    let target;
    while((target = stack.shift() as MenuItem) || stack.length){
      stack.unshift(...target.children);
      const el = Object.assign(document.createElement('div'), {
        innerText: target.name,
        className: `${target.type}-${target.name}`
      });
      this.mapMenuItem.set(el, target);
      this.mapMenuItem.set(target, el);
      root.appendChild(el);
    }
    this.update(menuItem);
    
    this.root.onclick = ({target}) => {
      const menuItem = this.mapMenuItem.get(target as HTMLElement) as MenuItem
      if(!menuItem) return;
      menuItem.toggle();
      this.update(menuItem);
    }
  }
  update(menuItem: MenuItem){
    const stack: {visible: boolean, menuItem: MenuItem}[] = [menuItem].map(child => ({visible: true, menuItem: child}));
    let target;
    while((target = stack.shift())){
      const {visible, menuItem} = target;
      const el = this.mapMenuItem.get(menuItem) as HTMLElement;
      if(!visible) el.style.display = 'none';
      else el.style.display = 'block';
      stack.push(...menuItem.children.map(child => ({visible: visible ? menuItem.isOpen : false, menuItem: child})));
    }
  }
}

const main = async() => {try{
  const root = document.getElementById('root') as HTMLElement;
  /**
   * 문제점.
   * 1. UI요소 + 로직 결합이 강화됨
   */
  const stack = [{ parent: null, data: domData }];
  let {parent, data}: any = stack.shift();
  let target = new MenuItem(data);
  if(parent) parent.children.push(target);
  stack.unshift(...data.children.map((child: any) => ({parent: target, data: child})));
  const rootMenuItem = target;
  
  while(stack.length){
    let {parent, data}: any = stack.shift();
    let target = new MenuItem(data);
    if(parent) parent.children.push(target);
    stack.unshift(...data.children.map((child: any) => ({parent: target, data: child})));
  }

  console.log('rootMenuItem', rootMenuItem);
  const render = new Reneder(root, rootMenuItem);
  console.log(render.mapMenuItem)


  document.body.appendChild(root);
}catch(error) {console.error(error)}}
main();


// this.el.addEventListener('click', ({target}) => [...this.children].reverse().forEach(child => {
//   if(!child.isOpen){
//     child.isOpen = true;
//     child.open(this.el);
//   }else{
//     child.isOpen = false
//     child.close();
//   }
// }));