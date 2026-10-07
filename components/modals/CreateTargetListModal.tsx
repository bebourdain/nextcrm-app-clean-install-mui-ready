"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { toast } from "sonner";
import { createTargetList } from "@/actions/crm/target-lists/create-target-list";

const CreateTargetListModal = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createTargetList({ name, description });
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Target list created successfully");
      setOpen(false);
      setName("");
      setDescription("");
      router.refresh();
    } catch {
      toast.error("Could not create target list.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button variant="contained" size="small" onClick={() => setOpen(true)}>
        + New List
      </Button>
      <Dialog open={open} onClose={() => !isLoading && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create Target List</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Create a new list to group your targets for campaigns or outreach.
          </DialogContentText>
          <Stack spacing={2} sx={{ mt: 3 }}>
            <TextField
              autoFocus
              fullWidth
              required
              label="Name"
              placeholder="Q1 Outreach List"
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isLoading}
            />
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              placeholder="A list of targets for Q1 outreach campaign"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isLoading}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={isLoading || !name.trim()}>
            {isLoading ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateTargetListModal;
