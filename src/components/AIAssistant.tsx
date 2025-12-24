import { useState, KeyboardEvent } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
} from "@heroui/react";
import {
  SparklesIcon,
  LightBulbIcon,
  PencilSquareIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import type { Editor } from "@tiptap/react";
import { aiService } from "../services/aiService";
import { useNotificationStore } from "../stores/notificationStore";

interface AIAssistantProps {
  editor: Editor | null;
  title: string;
  onTitleChange: (title: string) => void;
  onContentInsert: (content: string) => void;
}

type ActiveTab = "generate" | "titles" | "improve" | "seo";

export default function AIAssistant({
  editor,
  title,
  onTitleChange,
  onContentInsert,
}: AIAssistantProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>("generate");
  const [loading, setLoading] = useState<boolean>(false);
  const [topic, setTopic] = useState<string>("");
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const showNotification = useNotificationStore((state) => state.showNotification);

  const handleGenerateContent = async (): Promise<void> => {
    if (!topic.trim()) {
      showNotification({
        type: "error",
        title: "Topic Required",
        message: "Please enter a topic to generate content.",
      });
      return;
    }

    setLoading(true);
    try {
      const content = await aiService.generateContent(topic);
      setGeneratedContent(content);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Generation Failed",
        message: "Unable to generate content. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTitles = async (): Promise<void> => {
    const topicText = topic.trim() || title.trim() || "your blog post";
    setLoading(true);
    try {
      const titles = await aiService.generateTitles(topicText, 5);
      setTitleSuggestions(titles);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Generation Failed",
        message: "Unable to generate titles. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImproveContent = async (): Promise<void> => {
    if (!editor) return;

    const currentContent = editor.getText();
    if (!currentContent.trim()) {
      showNotification({
        type: "error",
        title: "No Content",
        message: "Please write some content first to improve it.",
      });
      return;
    }

    setLoading(true);
    try {
      const improved = await aiService.improveContent(currentContent);
      editor.commands.setContent(improved);
      showNotification({
        type: "success",
        title: "Content Improved",
        message: "Your content has been improved by AI!",
      });
      setIsOpen(false);
    } catch (error) {
      showNotification({
        type: "error",
        title: "Improvement Failed",
        message: "Unable to improve content. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetSEOSuggestions = async (): Promise<void> => {
    if (!editor) return;

    const currentContent = editor.getText();
    if (!currentContent.trim() || !title.trim()) {
      showNotification({
        type: "error",
        title: "Content Required",
        message: "Please add a title and some content first.",
      });
      return;
    }

    setLoading(true);
    try {
      const seo = await aiService.generateSEOSuggestions(title, currentContent);
      setGeneratedContent(
        `SEO Suggestions:\n\nKeywords: ${seo.keywords.join(", ")}\n\nMeta Description: ${seo.metaDescription}\n\nSuggestions:\n${seo.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
      );
    } catch (error) {
      showNotification({
        type: "error",
        title: "SEO Analysis Failed",
        message: "Unable to generate SEO suggestions.",
      });
    } finally {
      setLoading(false);
    }
  };

  const insertGeneratedContent = (): void => {
    if (generatedContent && editor) {
      editor.commands.insertContent(generatedContent);
      setIsOpen(false);
      showNotification({
        type: "success",
        title: "Content Inserted",
        message: "Generated content has been inserted into your editor.",
      });
    }
  };

  const useTitleSuggestion = (suggestedTitle: string): void => {
    onTitleChange(suggestedTitle);
    showNotification({
      type: "success",
      title: "Title Updated",
      message: "Suggested title has been applied.",
    });
  };

  return (
    <>
      <Button
        color="secondary"
        variant="flat"
        onPress={() => setIsOpen(true)}
        className="gap-2"
      >
        <SparklesIcon className="w-4 h-4" />
        <span className="hidden sm:inline">AI Assistant</span>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-secondary" />
            <span>AI Writing Assistant</span>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              {/* Tab Buttons */}
              <div className="flex gap-2 border-b border-base-300 pb-2">
                <Button
                  size="sm"
                  variant={activeTab === "generate" ? "solid" : "light"}
                  color={activeTab === "generate" ? "primary" : "default"}
                  onPress={() => setActiveTab("generate")}
                  className="flex items-center gap-2"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Generate
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "titles" ? "solid" : "light"}
                  color={activeTab === "titles" ? "primary" : "default"}
                  onPress={() => setActiveTab("titles")}
                  className="flex items-center gap-2"
                >
                  <LightBulbIcon className="w-4 h-4" />
                  Titles
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "improve" ? "solid" : "light"}
                  color={activeTab === "improve" ? "primary" : "default"}
                  onPress={() => setActiveTab("improve")}
                  className="flex items-center gap-2"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  Improve
                </Button>
                <Button
                  size="sm"
                  variant={activeTab === "seo" ? "solid" : "light"}
                  color={activeTab === "seo" ? "primary" : "default"}
                  onPress={() => setActiveTab("seo")}
                  className="flex items-center gap-2"
                >
                  <MagnifyingGlassIcon className="w-4 h-4" />
                  SEO
                </Button>
              </div>

              {/* Generate Tab */}
              {activeTab === "generate" && (
                <div className="space-y-4">
                  <Input
                    label="Topic"
                    placeholder="Enter a topic for your blog post..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyPress={(e: KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") handleGenerateContent();
                    }}
                  />
                  <Button
                    color="primary"
                    onPress={handleGenerateContent}
                    isLoading={loading}
                    className="w-full"
                  >
                    Generate Content
                  </Button>
                  {generatedContent &&
                    !generatedContent.includes("SEO Suggestions") && (
                      <div className="space-y-2">
                        <Textarea
                          label="Generated Content"
                          value={generatedContent}
                          onChange={(e) => setGeneratedContent(e.target.value)}
                          minRows={8}
                        />
                        <Button
                          color="success"
                          onPress={insertGeneratedContent}
                          className="w-full"
                        >
                          Insert into Editor
                        </Button>
                      </div>
                    )}
                </div>
              )}

              {/* Titles Tab */}
              {activeTab === "titles" && (
                <div className="space-y-4">
                  <Input
                    label="Topic or Current Title"
                    placeholder="Enter topic or use current title..."
                    value={topic || title}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                  <Button
                    color="primary"
                    onPress={handleGenerateTitles}
                    isLoading={loading}
                    className="w-full"
                  >
                    Generate Title Suggestions
                  </Button>
                  {titleSuggestions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Suggested Titles:</p>
                      {titleSuggestions.map((suggestedTitle, index) => (
                        <Button
                          key={index}
                          variant="flat"
                          className="w-full justify-start text-left"
                          onPress={() => useTitleSuggestion(suggestedTitle)}
                        >
                          {suggestedTitle}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Improve Tab */}
              {activeTab === "improve" && (
                <div className="space-y-4">
                  <p className="text-sm text-base-content/70">
                    AI will improve your current content to make it more engaging
                    and professional.
                  </p>
                  <Button
                    color="primary"
                    onPress={handleImproveContent}
                    isLoading={loading}
                    className="w-full"
                  >
                    Improve Current Content
                  </Button>
                </div>
              )}

              {/* SEO Tab */}
              {activeTab === "seo" && (
                <div className="space-y-4">
                  <p className="text-sm text-base-content/70">
                    Get SEO suggestions based on your title and content.
                  </p>
                  <Button
                    color="primary"
                    onPress={handleGetSEOSuggestions}
                    isLoading={loading}
                    className="w-full"
                  >
                    Get SEO Suggestions
                  </Button>
                  {generatedContent &&
                    generatedContent.includes("SEO Suggestions") && (
                      <div className="mt-4 p-4 bg-base-200 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">
                          {generatedContent}
                        </pre>
                      </div>
                    )}
                </div>
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsOpen(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}


