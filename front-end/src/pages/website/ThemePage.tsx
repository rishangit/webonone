import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, Star, Palette, Eye } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../../components/ui/alert-dialog";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchThemesRequest,
  updateThemeRequest,
  deleteThemeRequest,
  clearError,
} from "../../store/slices/companyWebThemesSlice";
import { CompanyWebTheme } from "../../services/companyWebThemes";

export const ThemePage = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { themes, loading, error } = useAppSelector((state) => state.companyWebThemes);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<CompanyWebTheme | null>(null);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchThemesRequest({ companyId }));
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    if (error) {
      console.error("Theme error:", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAdd = () => {
    navigate(`/web/${companyId}/theme/new`);
  };

  const handleEdit = (theme: CompanyWebTheme) => {
    navigate(`/web/${companyId}/theme/${theme.id}`);
  };

  const handleView = (theme: CompanyWebTheme) => {
    navigate(`/web/${companyId}/theme/${theme.id}?view=true`);
  };

  const handleDelete = (theme: CompanyWebTheme) => {
    setSelectedTheme(theme);
    setIsDeleteDialogOpen(true);
  };


  const handleDeleteConfirm = () => {
    if (selectedTheme) {
      dispatch(deleteThemeRequest(selectedTheme.id));
      setIsDeleteDialogOpen(false);
      setSelectedTheme(null);
      
      // Refresh themes list
      if (companyId) {
        setTimeout(() => {
          dispatch(fetchThemesRequest({ companyId }));
        }, 500);
      }
    }
  };

  const handleSetDefault = (theme: CompanyWebTheme) => {
    dispatch(updateThemeRequest({ 
      id: theme.id, 
      data: { isDefault: true } 
    }));
    
    // Refresh themes list
    if (companyId) {
      setTimeout(() => {
        dispatch(fetchThemesRequest({ companyId }));
      }, 500);
    }
  };

  const getThemePreviewStyle = (theme: CompanyWebTheme) => {
    return {
      '--preview-bg': theme.backgroundColor || 'transparent',
      '--preview-body-text': theme.bodyTextColor || 'inherit',
      '--preview-heading': theme.headingColor || 'inherit',
    } as React.CSSProperties;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Theme Management</h2>
          <p className="text-muted-foreground">Create and manage multiple themes for your website</p>
        </div>
        <Button
          onClick={handleAdd}
          className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Theme
        </Button>
      </div>

      {loading && themes.length === 0 ? (
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <p className="text-foreground">Loading themes...</p>
        </Card>
      ) : themes.length === 0 ? (
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="text-center py-8">
            <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground mb-4">No themes created yet</p>
            <Button
              onClick={handleAdd}
              variant="outline"
              className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Theme
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {themes.map((theme) => {
            const previewStyle = getThemePreviewStyle(theme);
            
            return (
              <Card
                key={theme.id}
                className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:shadow-lg transition-all"
                style={previewStyle}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{theme.name}</h3>
                        {theme.isDefault && (
                          <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                            <Star className="w-3 h-3 mr-1" />
                            Default
                          </Badge>
                        )}
                        {theme.isActive && (
                          <Badge variant="outline" className="border-green-500 text-green-600">
                            Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Theme Preview */}
                  <div
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: theme.backgroundColor || 'var(--card)',
                      color: theme.bodyTextColor || 'inherit',
                      borderColor: 'var(--border)',
                    }}
                  >
                    <div className="space-y-2">
                      <h4 
                        className="text-sm font-medium"
                        style={{ color: theme.headingColor || 'inherit' }}
                      >
                        Heading Preview
                      </h4>
                      <p className="text-xs" style={{ color: theme.bodyTextColor || 'inherit' }}>
                        Body text preview
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-[var(--glass-border)]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(theme)}
                      className="flex-1 bg-[var(--glass-bg)] border-[var(--glass-border)]"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(theme)}
                      className="flex-1 bg-[var(--glass-bg)] border-[var(--glass-border)]"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(theme)}
                      className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>

                  {!theme.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(theme)}
                      className="w-full text-xs"
                    >
                      <Star className="w-3 h-3 mr-1" />
                      Set as Default
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Theme</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedTheme?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedTheme(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
