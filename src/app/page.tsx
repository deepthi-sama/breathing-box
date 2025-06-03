import StarBreathing from "@/components/StarBreathing"
import NewBox from "@/components/NewBox"
import RainbowBreathing from "@/components/RainbowBreathing";
export default function Home(){
  return(
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100   gap-8">
       <NewBox/>
       <StarBreathing/>
       <RainbowBreathing/>
    </main>
  );
}
