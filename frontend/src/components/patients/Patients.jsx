import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Typography,
  Paper,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  InputAdornment,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  getPatients,
  createPatient,
  updatePatient,
  deletePatient,
} from "../../api";

const defaultForm = {
  name: "",
  email: "",
  phone: "",
};

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const searchTimeout = useRef();

  // Debounce search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPatients();
      setPatients(res.data || []);
      setError("");
    } catch {
      setError("Failed to fetch patients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const handleOpenDialog = (patient = null) => {
    if (patient) {
      setForm({
        name: patient.name || "",
        email: patient.email || "",
        phone: patient.phone || "",
      });
      setEditingId(patient.id);
    } else {
      setForm(defaultForm);
      setEditingId(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setForm(defaultForm);
    setEditingId(null);
    setDialogOpen(false);
    setError("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      // Only allow up to 10 digits for phone number
      if (!/^\d{0,10}$/.test(value)) return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || form.phone.length !== 10)
      return;

    try {
      if (editingId) {
        await updatePatient(editingId, form);
      } else {
        await createPatient(form);
      }
      await fetchPatients();
      handleCloseDialog();
    } catch {
      setError("Failed to save patient");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePatient(id);
      await fetchPatients();
    } catch {
      setError("Failed to delete patient");
    }
  };

  const filteredPatients = patients
    .filter((p) => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()))
    .sort((a, b) => {
      const valA = a[sortBy]?.toLowerCase?.() || "";
      const valB = b[sortBy]?.toLowerCase?.() || "";
      if (sortDir === "asc") return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          Patients
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Patient
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder="Search patients..."
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {loading && (
        <CircularProgress sx={{ display: "block", mx: "auto", my: 4 }} />
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && filteredPatients.length === 0 && (
        <Alert severity="info">No patients found.</Alert>
      )}

      {!loading && filteredPatients.length > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell
                  onClick={() => toggleSort("name")}
                  sx={{ cursor: "pointer" }}
                >
                  Name{" "}
                  {sortBy === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>{patient.name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenDialog(patient)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(patient.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Patient Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>{editingId ? "Edit Patient" : "Add Patient"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              margin="dense"
              name="name"
              label="Name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              margin="dense"
              name="email"
              label="Email"
              value={form.email}
              onChange={handleChange}
              required
              type="email"
            />
            <TextField
              fullWidth
              margin="dense"
              name="phone"
              label="Phone"
              value={form.phone}
              onChange={handleChange}
              required
              inputProps={{
                inputMode: "numeric",
                pattern: "\\d{10}",
                maxLength: 10,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Patients;
