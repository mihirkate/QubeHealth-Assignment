// Doctor Endpoints:
// POST   /doctors        Add doctor
// GET    /doctors        Get all doctors
// GET    /doctors/{id}   Get doctor by ID
// PUT    /doctors/{id}   Update doctor info
// DELETE /doctors/{id}   Delete doctor

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import {
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getDoctorById,
} from "../../api";

const defaultForm = {
  name: "",
  specialization: "",
  email: "",
};

const DoctorCard = React.memo(({ doctor }) => (
  <Grid item xs={12} md={6} lg={4}>
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      }}
    >
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          {doctor.name}
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            Specialty: {doctor.specialization || "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Email: {doctor.email || "N/A"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Phone: {doctor.phone || "N/A"}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  </Grid>
));

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const searchTimeout = useRef();

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getDoctors();
      setDoctors(res.data || []);
    } catch (err) {
      setError("Failed to fetch doctors");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  // Debounce search input
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [search]);

  const handleOpenAdd = () => {
    setForm(defaultForm);
    setEditingId(null);
    setOpen(true);
  };

  const handleOpenEdit = (doctor) => {
    setForm({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      email: doctor.email || "",
    });
    setEditingId(doctor.id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setForm(defaultForm);
    setEditingId(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.specialization || !form.email) return;
    try {
      if (editingId) {
        await updateDoctor(editingId, form);
      } else {
        await createDoctor(form);
      }
      await fetchDoctors();
      handleClose();
    } catch {
      setError("Failed to save doctor");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoctor(id);
      await fetchDoctors();
    } catch {
      setError("Failed to delete doctor");
    }
  };

  // Filter and sort doctors
  const filteredDoctors = doctors
    .filter((doc) =>
      [doc.name, doc.specialization, doc.email, doc.phone]
        .join(" ")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
    )
    .sort((a, b) => {
      const valA = (a[sortBy] || "").toLowerCase();
      const valB = (b[sortBy] || "").toLowerCase();
      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

  // Table view for doctors
  const renderTable = () => (
    <TableContainer
      component={Paper}
      sx={{
        mt: 2,
        borderRadius: 3,
        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setSortBy("name");
                setSortDir(
                  sortBy === "name" && sortDir === "asc" ? "desc" : "asc"
                );
              }}
            >
              <b>
                Name
                {sortBy === "name" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </b>
            </TableCell>
            <TableCell
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setSortBy("specialization");
                setSortDir(
                  sortBy === "specialization" && sortDir === "asc"
                    ? "desc"
                    : "asc"
                );
              }}
            >
              <b>
                Specialization
                {sortBy === "specialization"
                  ? sortDir === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </b>
            </TableCell>
            <TableCell
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setSortBy("email");
                setSortDir(
                  sortBy === "email" && sortDir === "asc" ? "desc" : "asc"
                );
              }}
            >
              <b>
                Email
                {sortBy === "email" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </b>
            </TableCell>
            <TableCell
              sx={{ cursor: "pointer" }}
              onClick={() => {
                setSortBy("phone");
                setSortDir(
                  sortBy === "phone" && sortDir === "asc" ? "desc" : "asc"
                );
              }}
            >
              <b>
                Phone
                {sortBy === "phone" ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
              </b>
            </TableCell>
            <TableCell>
              <b>Actions</b>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredDoctors.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>{doc.name}</TableCell>
              <TableCell>{doc.specialization || "N/A"}</TableCell>
              <TableCell>{doc.email || "N/A"}</TableCell>
              <TableCell>{doc.phone || "N/A"}</TableCell>
              <TableCell>
                <IconButton size="small" onClick={() => handleOpenEdit(doc)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => handleDelete(doc.id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h4" fontWeight={700} flex={1}>
          Doctors
        </Typography>
        <TextField
          size="small"
          variant="outlined"
          placeholder="Search doctors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1 }} />,
          }}
          sx={{ mr: 2, width: 260, background: "#fff" }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAdd}
        >
          Add Doctor
        </Button>
      </Box>
      {/* Always show table view */}
      {loading && (
        <Box textAlign="center" my={6}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && doctors.length === 0 && (
        <Alert severity="info">No doctors found.</Alert>
      )}

      {!loading && !error && doctors.length > 0 && renderTable()}

      {/* Add/Edit Doctor Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingId ? "Edit Doctor" : "Add Doctor"}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ minWidth: 350 }}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Specialization"
              name="specialization"
              value={form.specialization}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingId ? "Update" : "Add"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Doctors;
