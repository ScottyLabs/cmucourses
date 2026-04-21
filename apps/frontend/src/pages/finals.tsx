import FinalsViewer from "~/components/finals/FinalsViewer";
import { Page } from "~/components/Page";

export default function Finals() {
    return (
    <Page
      content={<FinalsViewer />}
      activePage="finals"
    />
    )
}