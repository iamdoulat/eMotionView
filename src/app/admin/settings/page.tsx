
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Manage your application settings here.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main settings page. More options can be added here.</p>
      </CardContent>
    </Card>
  );
}
