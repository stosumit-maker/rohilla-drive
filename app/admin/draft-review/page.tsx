import DraftReviewClient from "./DraftReviewClient";

export const metadata={
 title:"Draft Review",
 description:"Review private vehicle draft media and intentionally promote approved listings to public inventory.",
 alternates:{canonical:"/admin/draft-review"}
};

export default function Page(){return <DraftReviewClient/>}
