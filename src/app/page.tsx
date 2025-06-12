import StarBreathing from "@/components/StarBreathing"
import NewBox from "@/components/NewBox"
import RainbowBreathing from "@/components/RainbowBreathing";
import ThoughtBurner from "@/components/ThoughtBurner";
import PaperThought from "@/components/PaperThought";
export default function Home(){
  return(
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100   gap-8">
       <NewBox/>
       <StarBreathing/>
       <RainbowBreathing/>
       <ThoughtBurner/>
       <PaperThought/>
    </main>
  );
}
