import { PageLayout } from "@/components/client/page-layout"
import { auth } from "@/server/auth"
import { db } from "@/server/db"

export default async function TextToSpeechPage() {

    const session = await auth()

    const userId = session?.user.id

    let credits =0

    if(userId) {
        const user = await db.user.findUnique({
            where: {id: userId},
            select: {
                credits: true
            }
        })


        credits= user?.credits ?? 0
    }


    const service = "styletts2"
    return (
        <PageLayout service={service} showSidebar={true}>
            <h1>Children</h1>
        </PageLayout>
    )
}