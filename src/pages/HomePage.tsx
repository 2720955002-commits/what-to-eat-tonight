import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Shuffle } from 'lucide-react'

function HomePage() {
  return (
    <div className="flex flex-col items-center px-4 pt-12">
      <h1 className="mb-2 text-3xl font-bold text-text-primary">今晚吃啥</h1>
      <p className="mb-12 text-center text-text-secondary">
        还在纠结今晚吃什么吗？点一下，让命运替你决定。
      </p>
      
      <Button size="lg" className="mb-8 h-14 w-full max-w-xs rounded-[16px] text-lg shadow-lg">
        <Shuffle className="h-5 w-5" />
        抽一个菜
      </Button>
      
      <Card className="w-full">
        <CardContent className="flex flex-col items-center py-8">
          <p className="text-text-secondary">点击上方按钮开始抽选</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePage
