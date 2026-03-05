interface Props{
 current:string
 setCategory:(v:string)=>void
}

export const FilterProducts = ({ current, setCategory }: Props) => {
 return (
  <div style={{ marginBottom: 20 }}>

   <button
    style={{ fontWeight: current === "all" ? "bold" : "normal" }}
    onClick={() => setCategory("all")}
   >
    Все
   </button>

   <button
    style={{ fontWeight: current === "router" ? "bold" : "normal" }}
    onClick={() => setCategory("router")}
   >
    Router
   </button>

   <button
    style={{ fontWeight: current === "switch" ? "bold" : "normal" }}
    onClick={() => setCategory("switch")}
   >
    Switch
   </button>

  </div>
 )
}