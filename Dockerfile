FROM php:8.3-apache

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libxml2-dev \
    libcurl4-openssl-dev \
    libonig-dev \
    libsodium-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install \
        intl \
        mysqli \
        pdo_mysql \
        zip \
        gd \
        soap \
        mbstring \
        exif \
        opcache \
    && rm -rf /var/lib/apt/lists/*

RUN a2enmod rewrite

RUN echo "max_input_vars=5000" > /usr/local/etc/php/conf.d/moodle.ini \
    && echo "memory_limit=512M" >> /usr/local/etc/php/conf.d/moodle.ini \
    && echo "upload_max_filesize=100M" >> /usr/local/etc/php/conf.d/moodle.ini \
    && echo "post_max_size=100M" >> /usr/local/etc/php/conf.d/moodle.ini

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri \
    -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

WORKDIR /var/www/html

RUN mkdir -p /var/www/moodledata \
    && chown www-data:www-data /var/www/moodledata

# Persistent local hardening of public routes and PHP diagnostics.
COPY docker/apache-security.conf /etc/apache2/conf-enabled/zz-moodle-security.conf
COPY docker/php-security.ini /usr/local/etc/php/conf.d/zz-moodle-security.ini
