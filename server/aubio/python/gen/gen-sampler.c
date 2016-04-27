// WARNING: this file is generated, DO NOT EDIT

// WARNING: if you haven't read the first line yet, please do so
#include "aubiowraphell.h"

typedef struct
{
  PyObject_HEAD
  aubio_sampler_t * o;
  uint_t samplerate;
  uint_t hop_size;
} Py_sampler;

static char Py_sampler_doc[] = "sampler object";

static PyObject *
Py_sampler_new (PyTypeObject * pytype, PyObject * args, PyObject * kwds)
{
  Py_sampler *self;
  uint_t samplerate = 0;
  uint_t hop_size = 0;
  static char *kwlist[] = { "samplerate", "hop_size", NULL };

  if (!PyArg_ParseTupleAndKeywords (args, kwds, "|II", kwlist,
          &samplerate, &hop_size)) {
    return NULL;
  }

  self = (Py_sampler *) pytype->tp_alloc (pytype, 0);

  if (self == NULL) {
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

  self->hop_size = Py_default_vector_length / 2;
  if ((sint_t)hop_size > 0) {
    self->hop_size = hop_size;
  } else if ((sint_t)hop_size < 0) {
    PyErr_SetString (PyExc_ValueError,
        "can not use negative value for hop_size");
    return NULL;
  }

  return (PyObject *) self;
}

AUBIO_INIT(sampler , self->samplerate, self->hop_size)

AUBIO_DEL(sampler)

/* function Py_sampler_do */
static PyObject * 
Py_sampler_do(Py_sampler * self, PyObject * args)
{
  /* input vectors python prototypes */
  PyObject * input_obj;

  /* input vectors prototypes */
  fvec_t* input;
  /* output vectors prototypes */
  fvec_t* output;


  if (!PyArg_ParseTuple (args, "O", &input_obj)) {
    return NULL;
  }


  /* input vectors parsing */
  input = PyAubio_ArrayToCFvec (input_obj);

  if (input == NULL) {
    return NULL;
  }

  
  
  /* creating output output as a new_fvec of length self->hop_size */
  output = new_fvec (self->hop_size);


  /* compute _do function */
  aubio_sampler_do (self->o, input, output);

  return (PyObject *)PyAubio_CFvecToArray (output);
}

AUBIO_MEMBERS_START(sampler)
  {"samplerate", T_INT, offsetof (Py_sampler, samplerate), READONLY, ""},
  {"hop_size", T_INT, offsetof (Py_sampler, hop_size), READONLY, ""},
AUBIO_MEMBERS_STOP(sampler)


static PyObject *
Pyaubio_sampler_set_playing (Py_sampler *self, PyObject *args)
{
  uint_t err = 0;

  uint_t playing;

  if (!PyArg_ParseTuple (args, "I", &playing)) {
    return NULL;
  } 

  err = aubio_sampler_set_playing (self->o, playing);

  if (err > 0) {
    PyErr_SetString (PyExc_ValueError,
        "error running aubio_sampler_set_playing");
    return NULL;
  }
  Py_RETURN_NONE;
}

static PyObject *
Pyaubio_sampler_get_playing (Py_sampler *self, PyObject *unused)
{
  uint_t tmp = aubio_sampler_get_playing (self->o);
  return (PyObject *)PyInt_FromLong (tmp);
}

static PyMethodDef Py_sampler_methods[] = {
  {"set_playing", (PyCFunction) Pyaubio_sampler_set_playing,
    METH_VARARGS, ""},
  {"get_playing", (PyCFunction) Pyaubio_sampler_get_playing,
    METH_NOARGS, ""},
  {NULL} /* sentinel */
};

AUBIO_TYPEOBJECT(sampler, "aubio.sampler")
