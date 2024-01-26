import prismadb from "@/lib/prismadb"
import { ColorForm } from "./components/color-form";

const ColorPage = async ({
    params
}: {
    params: { colorId: string }
}) => {
    var color = null;
    try {
        color = await prismadb.color.findUnique({
            where: {
                id: params.colorId
            }
        });
    } catch (error) {
        console.log('ERROR: '+error);
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ColorForm initialData={color} />
            </div>
        </div>
    );
}

export default ColorPage