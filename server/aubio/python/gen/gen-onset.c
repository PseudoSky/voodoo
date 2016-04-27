// WARNING: this file is generated, DO NOT EDIT

// WARNING: if you haven't read the first line yet, please do so
#include "aubiowraphell.h"

typedef struct
{
  PyObject_HEAD
  aubio_onset_t * o;
  char_t* method;
  uint_t buf_size;
  uint_t hop_size;
  uint_t samplerate;
} Py_onset;

static char Py_onset_doc[] = "onset object";

static PyObject *
Py_onset_new (PyTypeObject * pytype, PyObject * args, PyObject * kwds)
{
  Py_onset *self;
  char_t* method = NULL;
  uint_t buf_size = 0;
  uint_t hop_size = 0;
  uint_t samplerate = 0;
  static char *kwlist[] = { "method", "buf_size", "hop_size", "samplerate", NULL };

  if (!PyArg_ParseTupleAndKeywords (args, kwds, "|sIII", kwlist,
          &method, &buf_size, &hop_size, &samplerate)) {
    return NULL;
  }

  self = (Py_onset *) pytype->tp_alloc (pytype, 0);

  if (self == NULL) {
    return NULL;
  }

  self->method = "default";
  if (method != NULL) {
    self->method = method;
  }

  self->buf_size = Py_default_vector_length;
  if ((sint_t)buf_size > 0) {
    self->buf_size = buf_size;
  } else if ((sint_t)buf_size < 0) {
    PyErr_SetString (PyExc_ValueError,
        "can not use negative value for buf_size");
    return NULL;
  }

  self->hop_size = Py_default_vector_length / 2;
  if ((sint_t)hop_size > 0) {
    self->hop_size = hop_size;
  } else if ((sint_t)hop_size < 0) {
    PyErr_SetString (PyExc_ValueError,
        "can not use negative value for hop_size");
    return NULL;
  }

  self->samplerate = Py_aubio_default_samplerate;
  if ((sint_t)samplerate > 0) {
    self->samplerate = samplerate;
  } else if ((sint_t)samplerate < 0) {
    PyErr_SetString (PyExc_ValueError,
        "can not use negative value for samplerate");
    return NULL;
  }

  return (PyObject *) self;
}

AUBIO_INIT(onset , self->method, self->buf_size, self->hop_size, self->samplerate)

AUBIO_DEL(onset)

/* function Py_onset_do */
static PyObject * 
Py_onset_do(Py_onset * self, PyObject * args)
{
  /* input vectors python prototypes */
  PyObject * input_obj;

  /* input vectors prototypes */
  fvec_t* input;
  /* output vectors prototypes */
  fvec_t* onset;


  if (!PyArg_ParseTuple (args, "O", &input_obj)) {
    return NULL;
  }


  /* input vectors parsing */
  input = PyAubio_ArrayToCFvec (input_obj);

  if (input == NULL) {
    return NULL;
  }

  
  
  /* creating output onset as a new_fvec of length 1 */
  onset = new_fvec (1);


  /* compute _do function */
  aubio_onset_do (self->o, input, onset);

  return (PyObject *)PyAubio_CFvecToArray (onset);
}

AUBIO_MEMBERS_START(onset)
  {"method", T_STRING, offsetof (Py_onset, method), READONLY, ""},
  {"buf_size", T_INT, offsetof (Py_onset, buf_size), READONLY, ""},
  {"hop_size", T_INT, offsetof (Py_onset, hop_size), READONLY, ""},
  {"samplerate", T_INT, offsetof (Py_onset, samplerate), READONLY, ""},
AUBIO_MEMBERS_STOP(onset)


static PyObject *
Pyaubio_onset_set_silence (Py_onset *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t silence;

  if (!PyArg_ParseTuple (args, "f", &silence)) {
    return NULL;
  } 

  err = aubio_onset_set_silence (self->o, silence);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_onset_set_silence");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_onset_set_threshold (Py_onset *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t threshold;

  if (!PyArg_ParseTuple (args, "f", &threshold)) {
    return NULL;
  } 

  err = aubio_onset_set_threshold (self->o, threshold);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_onset_set_threshold");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_onset_set_minioi (Py_onset *self, PyObject *args)
{
  uint_t err = 0;

  uint_t minioi;

  if (!PyArg_ParseTuple (args, "I", &minioi)) {
    return NULL;
  } 

  err = aubio_onset_set_minioi (self->o, minioi);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_onset_set_minioi");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_onset_set_minioi_s (Py_onset *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t minioi;

  if (!PyArg_ParseTuple (args, "f", &minioi)) {
    return NULL;
  } 

  err = aubio_onset_set_minioi_s (self->o, minioi);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_onset_set_minioi_s");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_onset_set_minioi_ms (Py_onset *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t minioi;

  if (!PyArg_ParseTuple (args, "f", &minioi)) {
    return NULL;
  } 

  err = aubio_onset_set_minioi_ms (self->o, minioi);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_onset_set_minioi_ms");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_onset_set_delay (Py_onset *self, PyObject *args)
{
  uint_t err = 0;

  uint_t delay;

  if (!PyArg_ParseTuple (args, "I", &delay)) {
    return NULL;
  } 

  err = aubio_onset_set_delay (self->o, delay);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_onset_set_delay");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_onset_set_delay_s (Py_onset *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t delay;

  if (!PyArg_ParseTuple (args, "f", &delay)) {
    return NULL;
  } 

  err = aubio_onset_set_delay_s (self->o, delay);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_onset_set_delay_s");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_onset_set_delay_ms (Py_onset *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t delay;

  if (!PyArg_ParseTuple (args, "f", &delay)) {
    return NULL;
  } 

  err = aubio_onset_set_delay_ms (self->o, delay);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_onset_set_delay_ms");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_onset_get_last (Py_onset *self, PyObject *unused)
{
  uint_t tmp = aubio_onset_get_last (self->o);
  return (PyObject *)PyInt_FromLong (tmp);
}

static PyObject *
Pyaubio_onset_get_last_s (Py_onset *self, PyObject *unused)
{
  smpl_t tmp = aubio_onset_get_last_s (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_onset_get_last_ms (Py_onset *self, PyObject *unused)
{
  smpl_t tmp = aubio_onset_get_last_ms (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_onset_get_silence (Py_onset *self, PyObject *unused)
{
  smpl_t tmp = aubio_onset_get_silence (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_onset_get_descriptor (Py_onset *self, PyObject *unused)
{
  smpl_t tmp = aubio_onset_get_descriptor (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_onset_get_thresholded_descriptor (Py_onset *self, PyObject *unused)
{
  smpl_t tmp = aubio_onset_get_thresholded_descriptor (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_onset_get_minioi (Py_onset *self, PyObject *unused)
{
  uint_t tmp = aubio_onset_get_minioi (self->o);
  return (PyObject *)PyInt_FromLong (tmp);
}

static PyObject *
Pyaubio_onset_get_minioi_s (Py_onset *self, PyObject *unused)
{
  smpl_t tmp = aubio_onset_get_minioi_s (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_onset_get_minioi_ms (Py_onset *self, PyObject *unused)
{
  smpl_t tmp = aubio_onset_get_minioi_ms (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_onset_get_delay (Py_onset *self, PyObject *unused)
{
  uint_t tmp = aubio_onset_get_delay (self->o);
  return (PyObject *)PyInt_FromLong (tmp);
}

static PyObject *
Pyaubio_onset_get_delay_s (Py_onset *self, PyObject *unused)
{
  smpl_t tmp = aubio_onset_get_delay_s (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_onset_get_delay_ms (Py_onset *self, PyObject *unused)
{
  smpl_t tmp = aubio_onset_get_delay_ms (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_onset_get_threshold (Py_onset *self, PyObject *unused)
{
  smpl_t tmp = aubio_onset_get_threshold (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyMethodDef Py_onset_methods[] = {
  {"set_silence", (PyCFunction) Pyaubio_onset_set_silence,
    METH_VARARGS, ""},
  {"set_threshold", (PyCFunction) Pyaubio_onset_set_threshold,
    METH_VARARGS, ""},
  {"set_minioi", (PyCFunction) Pyaubio_onset_set_minioi,
    METH_VARARGS, ""},
  {"set_minioi_s", (PyCFunction) Pyaubio_onset_set_minioi_s,
    METH_VARARGS, ""},
  {"set_minioi_ms", (PyCFunction) Pyaubio_onset_set_minioi_ms,
    METH_VARARGS, ""},
  {"set_delay", (PyCFunction) Pyaubio_onset_set_delay,
    METH_VARARGS, ""},
  {"set_delay_s", (PyCFunction) Pyaubio_onset_set_delay_s,
    METH_VARARGS, ""},
  {"set_delay_ms", (PyCFunction) Pyaubio_onset_set_delay_ms,
    METH_VARARGS, ""},
  {"get_last", (PyCFunction) Pyaubio_onset_get_last,
    METH_NOARGS, ""},
  {"get_last_s", (PyCFunction) Pyaubio_onset_get_last_s,
    METH_NOARGS, ""},
  {"get_last_ms", (PyCFunction) Pyaubio_onset_get_last_ms,
    METH_NOARGS, ""},
  {"get_silence", (PyCFunction) Pyaubio_onset_get_silence,
    METH_NOARGS, ""},
  {"get_descriptor", (PyCFunction) Pyaubio_onset_get_descriptor,
    METH_NOARGS, ""},
  {"get_thresholded_descriptor", (PyCFunction) Pyaubio_onset_get_thresholded_descriptor,
    METH_NOARGS, ""},
  {"get_minioi", (PyCFunction) Pyaubio_onset_get_minioi,
    METH_NOARGS, ""},
  {"get_minioi_s", (PyCFunction) Pyaubio_onset_get_minioi_s,
    METH_NOARGS, ""},
  {"get_minioi_ms", (PyCFunction) Pyaubio_onset_get_minioi_ms,
    METH_NOARGS, ""},
  {"get_delay", (PyCFunction) Pyaubio_onset_get_delay,
    METH_NOARGS, ""},
  {"get_delay_s", (PyCFunction) Pyaubio_onset_get_delay_s,
    METH_NOARGS, ""},
  {"get_delay_ms", (PyCFunction) Pyaubio_onset_get_delay_ms,
    METH_NOARGS, ""},
  {"get_threshold", (PyCFunction) Pyaubio_onset_get_threshold,
    METH_NOARGS, ""},
  {NULL} /* sentinel */
};

AUBIO_TYPEOBJECT(onset, "aubio.onset")
