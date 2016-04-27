// WARNING: this file is generated, DO NOT EDIT

// WARNING: if you haven't read the first line yet, please do so
#include "aubiowraphell.h"

typedef struct
{
  PyObject_HEAD
  aubio_tempo_t * o;
  char_t* method;
  uint_t buf_size;
  uint_t hop_size;
  uint_t samplerate;
} Py_tempo;

static char Py_tempo_doc[] = "tempo object";

static PyObject *
Py_tempo_new (PyTypeObject * pytype, PyObject * args, PyObject * kwds)
{
  Py_tempo *self;
  char_t* method = NULL;
  uint_t buf_size = 0;
  uint_t hop_size = 0;
  uint_t samplerate = 0;
  static char *kwlist[] = { "method", "buf_size", "hop_size", "samplerate", NULL };

  if (!PyArg_ParseTupleAndKeywords (args, kwds, "|sIII", kwlist,
          &method, &buf_size, &hop_size, &samplerate)) {
    return NULL;
  }

  self = (Py_tempo *) pytype->tp_alloc (pytype, 0);

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

AUBIO_INIT(tempo , self->method, self->buf_size, self->hop_size, self->samplerate)

AUBIO_DEL(tempo)

/* function Py_tempo_do */
static PyObject * 
Py_tempo_do(Py_tempo * self, PyObject * args)
{
  /* input vectors python prototypes */
  PyObject * input_obj;

  /* input vectors prototypes */
  fvec_t* input;
  /* output vectors prototypes */
  fvec_t* tempo;


  if (!PyArg_ParseTuple (args, "O", &input_obj)) {
    return NULL;
  }


  /* input vectors parsing */
  input = PyAubio_ArrayToCFvec (input_obj);

  if (input == NULL) {
    return NULL;
  }

  
  
  /* creating output tempo as a new_fvec of length 1 */
  tempo = new_fvec (1);


  /* compute _do function */
  aubio_tempo_do (self->o, input, tempo);

  return (PyObject *)PyAubio_CFvecToArray (tempo);
}

AUBIO_MEMBERS_START(tempo)
  {"method", T_STRING, offsetof (Py_tempo, method), READONLY, ""},
  {"buf_size", T_INT, offsetof (Py_tempo, buf_size), READONLY, ""},
  {"hop_size", T_INT, offsetof (Py_tempo, hop_size), READONLY, ""},
  {"samplerate", T_INT, offsetof (Py_tempo, samplerate), READONLY, ""},
AUBIO_MEMBERS_STOP(tempo)


static PyObject *
Pyaubio_tempo_set_silence (Py_tempo *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t silence;

  if (!PyArg_ParseTuple (args, "f", &silence)) {
    return NULL;
  } 

  err = aubio_tempo_set_silence (self->o, silence);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_tempo_set_silence");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_tempo_set_threshold (Py_tempo *self, PyObject *args)
{
  uint_t err = 0;

  smpl_t threshold;

  if (!PyArg_ParseTuple (args, "f", &threshold)) {
    return NULL;
  } 

  err = aubio_tempo_set_threshold (self->o, threshold);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_tempo_set_threshold");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_tempo_get_last (Py_tempo *self, PyObject *unused)
{
  uint_t tmp = aubio_tempo_get_last (self->o);
  return (PyObject *)PyInt_FromLong (tmp);
}

static PyObject *
Pyaubio_tempo_get_last_s (Py_tempo *self, PyObject *unused)
{
  smpl_t tmp = aubio_tempo_get_last_s (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_tempo_get_last_ms (Py_tempo *self, PyObject *unused)
{
  smpl_t tmp = aubio_tempo_get_last_ms (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_tempo_get_silence (Py_tempo *self, PyObject *unused)
{
  smpl_t tmp = aubio_tempo_get_silence (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_tempo_get_threshold (Py_tempo *self, PyObject *unused)
{
  smpl_t tmp = aubio_tempo_get_threshold (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_tempo_get_bpm (Py_tempo *self, PyObject *unused)
{
  smpl_t tmp = aubio_tempo_get_bpm (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyObject *
Pyaubio_tempo_get_confidence (Py_tempo *self, PyObject *unused)
{
  smpl_t tmp = aubio_tempo_get_confidence (self->o);
  return (PyObject *)PyFloat_FromDouble (tmp);
}

static PyMethodDef Py_tempo_methods[] = {
  {"set_silence", (PyCFunction) Pyaubio_tempo_set_silence,
    METH_VARARGS, ""},
  {"set_threshold", (PyCFunction) Pyaubio_tempo_set_threshold,
    METH_VARARGS, ""},
  {"get_last", (PyCFunction) Pyaubio_tempo_get_last,
    METH_NOARGS, ""},
  {"get_last_s", (PyCFunction) Pyaubio_tempo_get_last_s,
    METH_NOARGS, ""},
  {"get_last_ms", (PyCFunction) Pyaubio_tempo_get_last_ms,
    METH_NOARGS, ""},
  {"get_silence", (PyCFunction) Pyaubio_tempo_get_silence,
    METH_NOARGS, ""},
  {"get_threshold", (PyCFunction) Pyaubio_tempo_get_threshold,
    METH_NOARGS, ""},
  {"get_bpm", (PyCFunction) Pyaubio_tempo_get_bpm,
    METH_NOARGS, ""},
  {"get_confidence", (PyCFunction) Pyaubio_tempo_get_confidence,
    METH_NOARGS, ""},
  {NULL} /* sentinel */
};

AUBIO_TYPEOBJECT(tempo, "aubio.tempo")
