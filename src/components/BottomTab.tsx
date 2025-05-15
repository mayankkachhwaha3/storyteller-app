import {NavLink} from"react-router-dom";
const items=[
  {to:"/home",icon:"🏠"},
  {to:"/search",icon:"🔍"},
  {to:"/sub",icon:"📚"}
];

export default () => (
  <nav className="bg-zinc-800 h-14 flex justify-around items-center">
    {items.map(i=>(
      <NavLink 
        key={i.to} 
        to={i.to}
        className={({isActive})=>`text-2xl ${isActive?"text-accent":"text-zinc-500"}`}
      >
        {i.icon}
      </NavLink>
    ))}
  </nav>
);
