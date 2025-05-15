import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Search from "./pages/Search";
import SearchResults from "./pages/SearchResults";
import MediaPlayer from "./pages/MediaPlayer";
import Subscription from "./pages/Subscription";

export const routes=[
  {path:"/",element:<Welcome/>},
  {path:"/login",element:<Login/>},
  {path:"/home",element:<Home/>},
  {path:"/discover",element:<Discover/>},
  {path:"/search",element:<Search/>},
  {path:"/search/:query",element:<SearchResults/>},
  {path:"/player/:id",element:<MediaPlayer/>},
  {path:"/sub",element:<Subscription/>}
];
