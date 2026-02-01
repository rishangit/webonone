import { useState, useEffect, useRef } from "react";
import { Search, X, Check, Tag as TagIcon, ChevronDown, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTagsRequest, createTagRequest } from "../../store/slices/tagsSlice";
import { Tag } from "../../services/tags";

interface TagSelectorProps {
  value: string[];
  onChange: (tagIds: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxTags?: number;
}

export const TagSelector = ({
  value = [],
  onChange,
  placeholder = "Select tags",
  disabled = false,
  className = "",
  maxTags
}: TagSelectorProps) => {
  const dispatch = useAppDispatch();
  const { tags, loading, error } = useAppSelector((state) => state.tags);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [pendingTagName, setPendingTagName] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);

  // Fetch tags when component mounts or popover opens
  useEffect(() => {
    if (isOpen && tags.length === 0) {
      dispatch(fetchTagsRequest({ active: true }));
    }
  }, [isOpen, tags.length, dispatch]);

  // Reset search and pending state when popover closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setPendingTagName(null);
      setIsCreatingTag(false);
    }
  }, [isOpen]);

  // Focus search input when popover opens and measure trigger width
  useEffect(() => {
    if (isOpen) {
      if (searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
      // Measure trigger width when popover opens
      if (triggerRef.current) {
        setPopoverWidth(triggerRef.current.offsetWidth);
      }
    }
  }, [isOpen]);

  // Filter tags based on search term
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Check if search term doesn't match any existing tags (for showing "Create new tag" option)
  const canCreateNewTag = searchTerm.trim().length > 0 && 
    !filteredTags.some(tag => tag.name.toLowerCase() === searchTerm.toLowerCase().trim());

  // Generate a random color for new tags
  const generateTagColor = () => {
    const colors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#F59E0B', // amber
      '#EF4444', // red
      '#8B5CF6', // purple
      '#EC4899', // pink
      '#06B6D4', // cyan
      '#84CC16', // lime
      '#F97316', // orange
      '#6366F1', // indigo
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle creating a new tag
  const handleCreateNewTag = async () => {
    if (!searchTerm.trim() || isCreatingTag) return;

    const tagName = searchTerm.trim();
    
    // Check if tag already exists (case-insensitive)
    const existingTag = tags.find(tag => tag.name.toLowerCase() === tagName.toLowerCase());
    if (existingTag) {
      // If tag exists, just select it
      handleTagToggle(existingTag.id);
      setSearchTerm("");
      return;
    }

    setIsCreatingTag(true);
    setPendingTagName(tagName);
    
    // Create the new tag
    dispatch(createTagRequest({
      name: tagName,
      description: undefined,
      color: generateTagColor(),
      icon: undefined,
      isActive: true
    }));

    // The epic will handle the API call and add the tag to Redux store
    // We'll listen for the new tag in the store and auto-select it
  };

  // Auto-select newly created tag when it appears in the store
  useEffect(() => {
    if (pendingTagName && tags.length > 0) {
      const newTag = tags.find(tag => 
        tag.name.toLowerCase() === pendingTagName.toLowerCase() &&
        !value.includes(tag.id)
      );
      
      if (newTag) {
        // Tag was just created, auto-select it
        if (!maxTags || value.length < maxTags) {
          onChange([...value, newTag.id]);
        }
        setSearchTerm("");
        setPendingTagName(null);
        setIsCreatingTag(false);
      }
    }
  }, [tags, pendingTagName, value, maxTags, onChange]);

  // Reset creating state if there's an error
  useEffect(() => {
    if (error && isCreatingTag) {
      setIsCreatingTag(false);
      setPendingTagName(null);
    }
  }, [error, isCreatingTag]);

  // Get selected tag objects
  const selectedTags = tags.filter(tag => value.includes(tag.id));

  const handleTagToggle = (tagId: string) => {
    if (disabled) return;
    
    const isSelected = value.includes(tagId);
    
    if (isSelected) {
      // Remove tag
      onChange(value.filter(id => id !== tagId));
    } else {
      // Add tag (check maxTags limit)
      if (maxTags && value.length >= maxTags) {
        return;
      }
      onChange([...value, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(id => id !== tagId));
  };

  const isTagSelected = (tagId: string) => value.includes(tagId);

  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={`
              w-full justify-between h-12 md:h-9
              bg-[var(--input-background)] 
              border-[var(--glass-border)] 
              text-foreground
              hover:bg-accent
              text-lg md:text-sm
              font-normal
              ${selectedTags.length > 0 ? 'py-2 md:py-1' : ''}
            `}
          >
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {selectedTags.length > 0 ? (
                selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-0.5 text-xs"
                    style={{ 
                      backgroundColor: `${tag.color}20`, 
                      color: tag.color,
                      borderColor: `${tag.color}40`
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag.id, e);
                    }}
                  >
                    {tag.icon && <span>{tag.icon}</span>}
                    <span>{tag.name}</span>
                    {!disabled && (
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer hover:text-red-600" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTag(tag.id, e);
                        }}
                      />
                    )}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground font-normal">{placeholder}</span>
              )}
            </div>
            <ChevronDown className="ml-2 h-5 w-5 md:h-4 md:w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="p-0 bg-popover border-border"
          align="start"
          style={{ 
            width: popoverWidth ? `${popoverWidth}px` : 'var(--radix-popover-trigger-width)',
            minWidth: popoverWidth ? `${popoverWidth}px` : 'var(--radix-popover-trigger-width)'
          }}
        >
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search tags or create new..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && canCreateNewTag && !isCreatingTag) {
                    e.preventDefault();
                    handleCreateNewTag();
                  }
                }}
                className="pl-8 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground"></div>
              </div>
            ) : (
              <>
                {/* Show "Create new tag" option if search term doesn't match */}
                {canCreateNewTag && (
                  <div className="p-1 border-b border-border">
                    <div
                      onClick={handleCreateNewTag}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer
                        hover:bg-accent transition-colors
                        bg-accent/50 text-foreground
                        ${isCreatingTag ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${generateTagColor()}20`, color: generateTagColor() }}
                      >
                        <Plus className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">
                          {isCreatingTag ? 'Creating tag...' : `Create "${searchTerm.trim()}"`}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Add as new tag
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show existing tags */}
                {filteredTags.length === 0 && !canCreateNewTag ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {searchTerm ? "No tags found matching your search" : "No tags available"}
                  </div>
                ) : (
                  <div className="p-1">
                    {filteredTags.map((tag) => {
                      const selected = isTagSelected(tag.id);
                      return (
                        <div
                          key={tag.id}
                          onClick={() => handleTagToggle(tag.id)}
                          className={`
                            flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer
                            hover:bg-accent transition-colors
                            ${selected ? 'bg-accent text-accent-foreground' : 'text-foreground'}
                          `}
                        >
                          <div 
                            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                          >
                            {tag.icon || <TagIcon className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{tag.name}</div>
                            {tag.description && (
                              <div className="text-xs text-muted-foreground truncate">
                                {tag.description}
                              </div>
                            )}
                          </div>
                          {selected && (
                            <Check className="w-4 h-4 text-accent-foreground flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
          
          {maxTags && value.length >= maxTags && (
            <div className="p-2 border-t border-border bg-muted/50">
              <p className="text-xs text-muted-foreground text-center">
                Maximum {maxTags} {maxTags === 1 ? 'tag' : 'tags'} selected
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>
      
      {selectedTags.length > 0 && (
        <p className="text-xs text-muted-foreground mt-1">
          {selectedTags.length} {selectedTags.length === 1 ? 'tag' : 'tags'} selected
        </p>
      )}
    </div>
  );
};

