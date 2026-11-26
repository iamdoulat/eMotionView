import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminChatRetiredPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Chat Unavailable</CardTitle>
        <CardDescription>The built-in admin live chat module has been retired.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Customer inquiries can be handled via the contact details configured in Footer &amp; General Settings.
        </p>
      </CardContent>
    </Card>
  );
}
