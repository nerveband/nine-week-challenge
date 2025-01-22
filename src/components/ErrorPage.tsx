import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";
import { RefreshCw } from "lucide-react";

interface ErrorPageProps {
  title?: string;
  message?: string;
}

export function ErrorPage({ 
  title = "Something went wrong", 
  message = "We apologize for the inconvenience. Please try refreshing the page." 
}: ErrorPageProps) {
  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="text-center">
                <h1 className="text-2xl font-bold mb-2">9 Weeks to Sustainable Fat Loss</h1>
                <p className="text-xl text-muted-foreground">{title}</p>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              <p className="text-center text-muted-foreground">{message}</p>
              <Button 
                onClick={() => window.location.reload()}
                className="w-full max-w-xs"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
} 